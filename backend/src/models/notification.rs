use mongodb::bson::{oid::ObjectId, DateTime};
use serde::{Deserialize, Serialize};
use rocket_okapi::okapi::schemars::JsonSchema;

#[derive(Debug, Serialize, Deserialize, Clone, JsonSchema)]
#[serde(rename_all = "lowercase")]
pub enum NotificationType {
    NewWorker,
    NewJobSeeker,
    NewUser,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Notification {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub notification_type: NotificationType,
    pub title: String,
    pub message: String,
    pub reference_id: ObjectId, // worker_id, job_seeker_id, or user_id
    pub reference_type: String, // "worker", "job_seeker", "user"
    pub is_read: bool,
    pub created_at: DateTime,
}

#[derive(Debug, Serialize, JsonSchema)]
pub struct NotificationResponse {
    pub id: String,
    pub notification_type: String,
    pub title: String,
    pub message: String,
    pub reference_id: String,
    pub reference_type: String,
    pub is_read: bool,
    pub created_at: i64,
}

impl From<Notification> for NotificationResponse {
    fn from(notification: Notification) -> Self {
        NotificationResponse {
            id: notification.id.unwrap().to_hex(),
            notification_type: format!("{:?}", notification.notification_type).to_lowercase(),
            title: notification.title,
            message: notification.message,
            reference_id: notification.reference_id.to_hex(),
            reference_type: notification.reference_type,
            is_read: notification.is_read,
            created_at: notification.created_at.timestamp_millis(),
        }
    }
}
