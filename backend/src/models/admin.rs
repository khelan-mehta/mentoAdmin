use mongodb::bson::{oid::ObjectId, DateTime};
use serde::{Deserialize, Serialize};
use rocket_okapi::okapi::schemars;
use rocket_okapi::okapi::schemars::JsonSchema;

#[derive(Debug, Serialize, Deserialize, Clone, JsonSchema)]
#[serde(rename_all = "lowercase")]
pub enum AdminRole {
    SuperAdmin,
    Admin,
    Moderator,
}

impl Default for AdminRole {
    fn default() -> Self {
        AdminRole::Admin
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AdminUser {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,

    pub email: String,
    pub password_hash: String,
    pub name: String,
    pub role: AdminRole,
    pub is_active: bool,

    pub last_login_at: Option<DateTime>,
    pub created_at: DateTime,
    pub updated_at: DateTime,
}

#[derive(Debug, Deserialize, JsonSchema)]
pub struct AdminRegisterDto {
    pub email: String,
    pub password: String,
    pub name: String,
}

#[derive(Debug, Deserialize, JsonSchema)]
pub struct AdminLoginDto {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Deserialize, JsonSchema)]
pub struct AdminRefreshTokenDto {
    pub refresh_token: String,
}

#[derive(Debug, Serialize, JsonSchema)]
pub struct AdminAuthResponse {
    pub access_token: String,
    pub refresh_token: String,
    pub user: AdminUserResponse,
}

#[derive(Debug, Serialize, JsonSchema)]
pub struct AdminUserResponse {
    pub id: String,
    pub email: String,
    pub name: String,
    pub role: String,
}

impl From<AdminUser> for AdminUserResponse {
    fn from(admin: AdminUser) -> Self {
        AdminUserResponse {
            id: admin.id.unwrap().to_hex(),
            email: admin.email,
            name: admin.name,
            role: format!("{:?}", admin.role).to_lowercase(),
        }
    }
}
