use mongodb::bson::{doc, oid::ObjectId, DateTime};
use rocket::serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(crate = "rocket::serde")]
pub struct Notification {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub user_id: ObjectId, // Admin user who will receive the notification
    pub notification_type: String, // "new_worker", "new_job_seeker", "new_job", etc.
    pub title: String,
    pub body: String,
    pub related_id: Option<ObjectId>, // ID of the related entity (worker_id, job_seeker_id, etc.)
    pub is_read: bool,
    pub created_at: DateTime,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct CreateNotificationDto {
    pub user_id: ObjectId,
    pub notification_type: String,
    pub title: String,
    pub body: String,
    pub related_id: Option<ObjectId>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct NotificationResponse {
    pub id: String,
    pub user_id: String,
    pub notification_type: String,
    pub title: String,
    pub body: String,
    pub related_id: Option<String>,
    pub is_read: bool,
    pub created_at: DateTime,
}

impl From<Notification> for NotificationResponse {
    fn from(notification: Notification) -> Self {
        NotificationResponse {
            id: notification.id.unwrap_or_else(ObjectId::new).to_hex(),
            user_id: notification.user_id.to_hex(),
            notification_type: notification.notification_type,
            title: notification.title,
            body: notification.body,
            related_id: notification.related_id.map(|id| id.to_hex()),
            is_read: notification.is_read,
            created_at: notification.created_at,
        }
    }
}
