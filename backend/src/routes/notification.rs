use crate::db::DbConn;
use crate::models::{CreateNotificationDto, Notification, NotificationResponse};
use mongodb::bson::{DateTime as BsonDateTime, doc, oid::ObjectId};
use rocket::serde::json::Json;
use rocket::{State, http::Status};

// Helper function to create a notification for all admins
pub async fn create_admin_notification(
    db: &mongodb::Database,
    notification_type: String,
    title: String,
    body: String,
    related_id: Option<ObjectId>,
) -> Result<(), String> {
    // For now, we'll create a notification for all users (you can filter by admin role later)
    // In a real system, you'd want to query for admin users specifically
    let notification = Notification {
        id: None,
        user_id: ObjectId::new(), // This should be replaced with actual admin user IDs
        notification_type,
        title,
        body,
        related_id,
        is_read: false,
        created_at: BsonDateTime::now(),
    };

    db.collection::<Notification>("notifications")
        .insert_one(notification, None)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

// Get all notifications
#[get("/notifications?<page>&<limit>&<is_read>")]
pub async fn get_notifications(
    db: &State<DbConn>,
    page: Option<u64>,
    limit: Option<u64>,
    is_read: Option<bool>,
) -> Result<Json<serde_json::Value>, Status> {
    let page = page.unwrap_or(1);
    let limit = limit.unwrap_or(20);
    let skip = (page - 1) * limit;

    let mut filter = doc! {};
    if let Some(read_status) = is_read {
        filter.insert("is_read", read_status);
    }

    let collection = db.collection::<Notification>("notifications");

    let total = collection
        .count_documents(filter.clone(), None)
        .await
        .unwrap_or(0);

    let mut cursor = collection
        .find(filter, None)
        .await
        .map_err(|_| Status::InternalServerError)?;

    let mut notifications = Vec::new();

    while cursor
        .advance()
        .await
        .map_err(|_| Status::InternalServerError)?
    {
        let notification = cursor
            .deserialize_current()
            .map_err(|_| Status::InternalServerError)?;
        notifications.push(NotificationResponse::from(notification));
    }

    // Sort by created_at descending
    notifications.sort_by(|a, b| {
        b.created_at
            .timestamp_millis()
            .cmp(&a.created_at.timestamp_millis())
    });

    // Apply pagination
    let paginated: Vec<NotificationResponse> = notifications
        .into_iter()
        .skip(skip as usize)
        .take(limit as usize)
        .collect();

    Ok(Json(serde_json::json!({
        "success": true,
        "data": {
            "notifications": paginated,
            "total": total,
            "page": page,
            "limit": limit,
        }
    })))
}

// Mark notification as read
#[put("/notifications/<notification_id>/read")]
pub async fn mark_notification_read(
    db: &State<DbConn>,
    notification_id: String,
) -> Result<Json<serde_json::Value>, Status> {
    let oid = ObjectId::parse_str(&notification_id).map_err(|_| Status::BadRequest)?;

    let result = db
        .collection::<Notification>("notifications")
        .update_one(
            doc! { "_id": oid },
            doc! { "$set": { "is_read": true } },
            None,
        )
        .await
        .map_err(|_| Status::InternalServerError)?;

    if result.modified_count == 0 {
        return Err(Status::NotFound);
    }

    Ok(Json(serde_json::json!({
        "success": true,
        "message": "Notification marked as read"
    })))
}

// Mark all notifications as read
#[put("/notifications/read-all")]
pub async fn mark_all_notifications_read(
    db: &State<DbConn>,
) -> Result<Json<serde_json::Value>, Status> {
    let result = db
        .collection::<Notification>("notifications")
        .update_many(
            doc! { "is_read": false },
            doc! { "$set": { "is_read": true } },
            None,
        )
        .await
        .map_err(|_| Status::InternalServerError)?;

    Ok(Json(serde_json::json!({
        "success": true,
        "message": format!("{} notifications marked as read", result.modified_count)
    })))
}

// Delete a notification
#[delete("/notifications/<notification_id>")]
pub async fn delete_notification(
    db: &State<DbConn>,
    notification_id: String,
) -> Result<Json<serde_json::Value>, Status> {
    let oid = ObjectId::parse_str(&notification_id).map_err(|_| Status::BadRequest)?;

    let result = db
        .collection::<Notification>("notifications")
        .delete_one(doc! { "_id": oid }, None)
        .await
        .map_err(|_| Status::InternalServerError)?;

    if result.deleted_count == 0 {
        return Err(Status::NotFound);
    }

    Ok(Json(serde_json::json!({
        "success": true,
        "message": "Notification deleted"
    })))
}

// Get unread notification count
#[get("/notifications/unread-count")]
pub async fn get_unread_count(db: &State<DbConn>) -> Result<Json<serde_json::Value>, Status> {
    let count = db
        .collection::<Notification>("notifications")
        .count_documents(doc! { "is_read": false }, None)
        .await
        .unwrap_or(0);

    Ok(Json(serde_json::json!({
        "success": true,
        "data": {
            "unread_count": count
        }
    })))
}

// Admin: Create a notification manually
#[post("/admin/notifications", data = "<notification_data>")]
pub async fn create_notification(
    db: &State<DbConn>,
    notification_data: Json<CreateNotificationDto>,
) -> Result<Json<serde_json::Value>, Status> {
    let notification = Notification {
        id: None,
        user_id: notification_data.user_id,
        notification_type: notification_data.notification_type.clone(),
        title: notification_data.title.clone(),
        body: notification_data.body.clone(),
        related_id: notification_data.related_id,
        is_read: false,
        created_at: BsonDateTime::now(),
    };

    let result = db
        .collection::<Notification>("notifications")
        .insert_one(notification, None)
        .await
        .map_err(|_| Status::InternalServerError)?;

    Ok(Json(serde_json::json!({
        "success": true,
        "message": "Notification created",
        "data": {
            "notification_id": result.inserted_id.as_object_id().unwrap().to_hex()
        }
    })))
}
