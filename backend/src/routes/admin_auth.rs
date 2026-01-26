use crate::db::DbConn;
use crate::models::{AdminUser, AdminRegisterDto, AdminLoginDto, AdminRefreshTokenDto, AdminAuthResponse, AdminUserResponse, AdminRole};
use crate::services::JwtService;
use crate::utils::{ApiError, ApiResponse};
use mongodb::bson::{doc, DateTime, oid::ObjectId};
use rocket::State;
use rocket::serde::json::Json;
use rocket_okapi::openapi;
use bcrypt::{hash, verify, DEFAULT_COST};

// ==================== ADMIN REGISTER ====================
#[openapi(tag = "Admin Auth")]
#[post("/admin/auth/register", data = "<dto>")]
pub async fn admin_register(
    db: &State<DbConn>,
    dto: Json<AdminRegisterDto>,
) -> Result<Json<ApiResponse<AdminAuthResponse>>, ApiError> {
    // Validate email format
    if !dto.email.contains('@') || dto.email.len() < 5 {
        return Err(ApiError::bad_request("Invalid email format"));
    }

    // Validate password strength
    if dto.password.len() < 6 {
        return Err(ApiError::bad_request("Password must be at least 6 characters"));
    }

    // Validate name
    if dto.name.trim().is_empty() {
        return Err(ApiError::bad_request("Name is required"));
    }

    // Check if email already exists
    let existing = db.collection::<AdminUser>("admin_users")
        .find_one(doc! { "email": &dto.email.to_lowercase() }, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Database error: {}", e)))?;

    if existing.is_some() {
        return Err(ApiError::bad_request("Email already registered"));
    }

    // Hash password
    let password_hash = hash(&dto.password, DEFAULT_COST)
        .map_err(|e| ApiError::internal_error(format!("Password hashing error: {}", e)))?;

    // Create admin user
    let now = DateTime::now();
    let admin_id = ObjectId::new();

    let admin_user = AdminUser {
        id: Some(admin_id),
        email: dto.email.to_lowercase(),
        password_hash,
        name: dto.name.trim().to_string(),
        role: AdminRole::Admin,
        is_active: true,
        last_login_at: Some(now),
        created_at: now,
        updated_at: now,
    };

    db.collection::<AdminUser>("admin_users")
        .insert_one(&admin_user, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Failed to create admin: {}", e)))?;

    // Generate tokens
    let access_token = JwtService::generate_admin_access_token(&admin_id, &admin_user.email)
        .map_err(|e| ApiError::internal_error(format!("Token generation error: {}", e)))?;

    let refresh_token = JwtService::generate_admin_refresh_token(&admin_id, &admin_user.email)
        .map_err(|e| ApiError::internal_error(format!("Token generation error: {}", e)))?;

    Ok(Json(ApiResponse::success(AdminAuthResponse {
        access_token,
        refresh_token,
        user: AdminUserResponse::from(admin_user),
    })))
}

// ==================== ADMIN LOGIN ====================
#[openapi(tag = "Admin Auth")]
#[post("/admin/auth/login", data = "<dto>")]
pub async fn admin_login(
    db: &State<DbConn>,
    dto: Json<AdminLoginDto>,
) -> Result<Json<ApiResponse<AdminAuthResponse>>, ApiError> {
    // Find admin by email
    let admin = db.collection::<AdminUser>("admin_users")
        .find_one(doc! { "email": &dto.email.to_lowercase() }, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Database error: {}", e)))?
        .ok_or_else(|| ApiError::unauthorized("Invalid email or password"))?;

    // Check if account is active
    if !admin.is_active {
        return Err(ApiError::unauthorized("Account is deactivated"));
    }

    // Verify password
    let is_valid = verify(&dto.password, &admin.password_hash)
        .map_err(|_| ApiError::internal_error("Password verification error"))?;

    if !is_valid {
        return Err(ApiError::unauthorized("Invalid email or password"));
    }

    let admin_id = admin.id.unwrap();

    // Update last login
    db.collection::<AdminUser>("admin_users")
        .update_one(
            doc! { "_id": admin_id },
            doc! { "$set": { "last_login_at": DateTime::now() } },
            None
        )
        .await
        .ok();

    // Generate tokens
    let access_token = JwtService::generate_admin_access_token(&admin_id, &admin.email)
        .map_err(|e| ApiError::internal_error(format!("Token generation error: {}", e)))?;

    let refresh_token = JwtService::generate_admin_refresh_token(&admin_id, &admin.email)
        .map_err(|e| ApiError::internal_error(format!("Token generation error: {}", e)))?;

    Ok(Json(ApiResponse::success(AdminAuthResponse {
        access_token,
        refresh_token,
        user: AdminUserResponse::from(admin),
    })))
}

// ==================== ADMIN REFRESH TOKEN ====================
#[openapi(tag = "Admin Auth")]
#[post("/admin/auth/refresh", data = "<dto>")]
pub async fn admin_refresh_token(
    db: &State<DbConn>,
    dto: Json<AdminRefreshTokenDto>,
) -> Result<Json<ApiResponse<AdminAuthResponse>>, ApiError> {
    // Verify refresh token
    let claims = JwtService::verify_admin_token(&dto.refresh_token, true)
        .map_err(|_| ApiError::unauthorized("Invalid or expired refresh token"))?;

    let admin_id = ObjectId::parse_str(&claims.sub)
        .map_err(|_| ApiError::unauthorized("Invalid token"))?;

    // Fetch admin user
    let admin = db.collection::<AdminUser>("admin_users")
        .find_one(doc! { "_id": admin_id }, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Database error: {}", e)))?
        .ok_or_else(|| ApiError::unauthorized("Admin not found"))?;

    // Check if account is active
    if !admin.is_active {
        return Err(ApiError::unauthorized("Account is deactivated"));
    }

    // Generate new tokens
    let access_token = JwtService::generate_admin_access_token(&admin_id, &admin.email)
        .map_err(|e| ApiError::internal_error(format!("Token generation error: {}", e)))?;

    let refresh_token = JwtService::generate_admin_refresh_token(&admin_id, &admin.email)
        .map_err(|e| ApiError::internal_error(format!("Token generation error: {}", e)))?;

    Ok(Json(ApiResponse::success(AdminAuthResponse {
        access_token,
        refresh_token,
        user: AdminUserResponse::from(admin),
    })))
}

// ==================== GET CURRENT ADMIN ====================
#[openapi(tag = "Admin Auth")]
#[get("/admin/auth/me")]
pub async fn admin_me(
    db: &State<DbConn>,
    auth: crate::guards::AdminGuard,
) -> Result<Json<ApiResponse<AdminUserResponse>>, ApiError> {
    let admin = db.collection::<AdminUser>("admin_users")
        .find_one(doc! { "_id": auth.admin_id }, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Database error: {}", e)))?
        .ok_or_else(|| ApiError::not_found("Admin not found"))?;

    Ok(Json(ApiResponse::success(AdminUserResponse::from(admin))))
}
