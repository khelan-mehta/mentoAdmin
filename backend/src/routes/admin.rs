use crate::db::DbConn;
use crate::models::{CategoryResponse, MainCategory, SubCategory, SubCategoryResponse, WorkerProfile, JobSeekerProfile, User, Subscription, SubscriptionType, SubscriptionStatus};
use crate::utils::{ApiError, ApiResponse};
use mongodb::bson::{doc, DateTime, oid::ObjectId};
use mongodb::options::FindOptions;
use rocket::State;
use rocket::serde::json::Json;
use rocket_okapi::openapi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use reqwest::Client;

// Internal struct to deserialize from MongoDB services collection
#[derive(Debug, Serialize, Deserialize)]
struct Service {
    #[serde(rename = "_id")]
    id: ObjectId,
    #[serde(rename = "serviceId")]
    service_id: String,
    name: String,
    #[serde(rename = "serviceCategory")]
    service_category: String,
    price: String,
    rating: String,
    description: String,
    icon: String,
    color: String,
}

#[openapi(tag = "Category")]
#[get("/category/all")]
pub async fn get_all_categories(
    db: &State<DbConn>,
) -> Result<Json<ApiResponse<Vec<CategoryResponse>>>, ApiError> {
    // Fetch all services from the services collection
    let mut cursor = db
        .collection::<Service>("services")
        .find(None, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Database error: {}", e)))?;

    let mut services = Vec::new();
    while cursor
        .advance()
        .await
        .map_err(|e| ApiError::internal_error(format!("Cursor error: {}", e)))?
    {
        let service = cursor
            .deserialize_current()
            .map_err(|e| ApiError::internal_error(format!("Deserialization error: {}", e)))?;
        services.push(service);
    }

    // Group services by serviceCategory
    let mut categories_map: HashMap<String, Vec<Service>> = HashMap::new();
    for service in services {
        categories_map
            .entry(service.service_category.clone())
            .or_insert_with(Vec::new)
            .push(service);
    }

    // Build CategoryResponse objects
    let mut categories: Vec<CategoryResponse> = Vec::new();
    for (category_name, services) in categories_map {
        // Use first service's icon for the category
        let icon = services.first().map(|s| s.icon.clone());

        let subcategories: Vec<SubCategoryResponse> = services
            .iter()
            .map(|s| SubCategoryResponse {
                id: s.id.to_hex(),
                name: s.name.clone(),
                description: Some(s.description.clone()),
            })
            .collect();

        categories.push(CategoryResponse {
            id: category_name.clone(), // Use category name as ID since we don't have a separate category ID
            name: category_name,
            description: None,
            icon,
            subcategories,
        });
    }

    // Sort categories alphabetically
    categories.sort_by(|a, b| a.name.cmp(&b.name));

    Ok(Json(ApiResponse::success(categories)))
}

#[openapi(tag = "Category")]
#[get("/category/<category_name>/subcategories")]
pub async fn get_subcategories(
    db: &State<DbConn>,
    category_name: String,
) -> Result<Json<ApiResponse<Vec<SubCategoryResponse>>>, ApiError> {
    let mut cursor = db
        .collection::<Service>("services")
        .find(
            doc! {
                "serviceCategory": &category_name
            },
            None,
        )
        .await
        .map_err(|e| ApiError::internal_error(format!("Database error: {}", e)))?;

    let mut subcategories = Vec::new();
    while cursor
        .advance()
        .await
        .map_err(|e| ApiError::internal_error(format!("Cursor error: {}", e)))?
    {
        let service = cursor
            .deserialize_current()
            .map_err(|e| ApiError::internal_error(format!("Deserialization error: {}", e)))?;

        subcategories.push(SubCategoryResponse {
            id: service.id.to_hex(),
            name: service.name,
            description: Some(service.description),
        });
    }

    if subcategories.is_empty() {
        return Err(ApiError::not_found("Category not found"));
    }

    Ok(Json(ApiResponse::success(subcategories)))
}

// ==================== WORKER ADMIN ROUTES ====================

#[derive(FromForm, serde::Deserialize, rocket_okapi::okapi::schemars::JsonSchema)]
pub struct WorkerListQuery {
    pub status: Option<String>,
    pub is_verified: Option<bool>,
    pub page: Option<i64>,
    pub limit: Option<i64>,
}

#[openapi(tag = "Admin - Workers")]
#[get("/admin/workers?<query..>")]
pub async fn get_all_workers(
    db: &State<DbConn>,
    query: WorkerListQuery,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(20).min(100);
    let skip = (page - 1) * limit;

    let mut filter = doc! {};
    if let Some(is_verified) = query.is_verified {
        filter.insert("is_verified", is_verified);
    }

    let find_options = FindOptions::builder()
        .skip(skip as u64)
        .limit(limit)
        .sort(doc! { "created_at": -1 })
        .build();

    let mut cursor = db.collection::<WorkerProfile>("worker_profiles")
        .find(filter.clone(), find_options)
        .await
        .map_err(|e| ApiError::internal_error(format!("Database error: {}", e)))?;

    let mut workers = Vec::new();
    while cursor.advance().await.map_err(|e| ApiError::internal_error(format!("Cursor error: {}", e)))? {
        let mut worker = cursor.deserialize_current()
            .map_err(|e| ApiError::internal_error(format!("Deserialization error: {}", e)))?;
        workers.push(worker);
    }

    // Fetch user data and payment_id for each worker
    let mut workers_with_user_data = Vec::new();
    for worker in workers {
        let mut worker_json = serde_json::to_value(&worker)
            .map_err(|e| ApiError::internal_error(format!("Serialization error: {}", e)))?;

        // Fetch user data
        if let Ok(user) = db.collection::<User>("users")
            .find_one(doc! { "_id": worker.user_id }, None)
            .await
        {
            if let Some(user) = user {
                if let Some(obj) = worker_json.as_object_mut() {
                    obj.insert("user_name".to_string(), serde_json::json!(user.name));
                    obj.insert("user_mobile".to_string(), serde_json::json!(user.mobile));
                    obj.insert("user_email".to_string(), serde_json::json!(user.email));
                }
            }
        }

        // Fetch payment_id from subscriptions collection
        if let Ok(Some(subscription)) = db.collection::<Subscription>("subscriptions")
            .find_one(
                doc! {
                    "user_id": worker.user_id,
                    "subscription_type": "worker",
                    "status": "active"
                },
                None,
            )
            .await
        {
            if let Some(obj) = worker_json.as_object_mut() {
                obj.insert("payment_id".to_string(), serde_json::json!(subscription.payment_id));
            }
        }

        workers_with_user_data.push(worker_json);
    }

    let total = db.collection::<WorkerProfile>("worker_profiles")
        .count_documents(filter, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Count error: {}", e)))?;

    Ok(Json(ApiResponse::success(serde_json::json!({
        "workers": workers_with_user_data,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total as f64 / limit as f64).ceil() as i64,
        }
    }))))
}

#[derive(serde::Deserialize, rocket_okapi::okapi::schemars::JsonSchema)]
pub struct UpdateWorkerVerificationDto {
    pub is_verified: bool,
}

#[openapi(tag = "Admin - Workers")]
#[put("/admin/workers/<worker_id>/verify", data = "<dto>")]
pub async fn verify_worker(
    db: &State<DbConn>,
    worker_id: String,
    dto: Json<UpdateWorkerVerificationDto>,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let object_id = ObjectId::parse_str(&worker_id)
        .map_err(|_| ApiError::bad_request("Invalid worker ID"))?;

    db.collection::<WorkerProfile>("worker_profiles")
        .update_one(
            doc! { "_id": object_id },
            doc! { "$set": { "is_verified": dto.is_verified, "updated_at": DateTime::now() } },
            None
        )
        .await
        .map_err(|e| ApiError::internal_error(format!("Failed to update worker: {}", e)))?;

    Ok(Json(ApiResponse::success(serde_json::json!({
        "message": if dto.is_verified { "Worker verified successfully" } else { "Worker verification revoked" }
    }))))
}

// ==================== JOB SEEKER ADMIN ROUTES ====================

#[derive(FromForm, serde::Deserialize, rocket_okapi::okapi::schemars::JsonSchema)]
pub struct JobSeekerListQuery {
    pub is_verified: Option<bool>,
    pub page: Option<i64>,
    pub limit: Option<i64>,
}

#[openapi(tag = "Admin - Job Seekers")]
#[get("/admin/job-seekers?<query..>")]
pub async fn get_all_job_seekers(
    db: &State<DbConn>,
    query: JobSeekerListQuery,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(20).min(100);
    let skip = (page - 1) * limit;

    let mut filter = doc! {};
    if let Some(is_verified) = query.is_verified {
        filter.insert("is_verified", is_verified);
    }

    let find_options = FindOptions::builder()
        .skip(skip as u64)
        .limit(limit)
        .sort(doc! { "created_at": -1 })
        .build();

    let mut cursor = db.collection::<JobSeekerProfile>("job_seeker_profiles")
        .find(filter.clone(), find_options)
        .await
        .map_err(|e| ApiError::internal_error(format!("Database error: {}", e)))?;

    let mut profiles = Vec::new();
    while cursor.advance().await.map_err(|e| ApiError::internal_error(format!("Cursor error: {}", e)))? {
        let profile = cursor.deserialize_current()
            .map_err(|e| ApiError::internal_error(format!("Deserialization error: {}", e)))?;
        profiles.push(profile);
    }

    // Fetch user data and payment_id for each job seeker profile
    let mut profiles_with_user_data = Vec::new();
    for profile in profiles {
        let mut profile_json = serde_json::to_value(&profile)
            .map_err(|e| ApiError::internal_error(format!("Serialization error: {}", e)))?;

        // Fetch user data
        if let Ok(user) = db.collection::<User>("users")
            .find_one(doc! { "_id": profile.user_id }, None)
            .await
        {
            if let Some(user) = user {
                if let Some(obj) = profile_json.as_object_mut() {
                    obj.insert("user_mobile".to_string(), serde_json::json!(user.mobile));
                    obj.insert("user_email".to_string(), serde_json::json!(user.email));
                    obj.insert("user_photo".to_string(), serde_json::json!(user.profile_photo));
                }
            }
        }

        // Fetch payment_id from subscriptions collection
        if let Ok(Some(subscription)) = db.collection::<Subscription>("subscriptions")
            .find_one(
                doc! {
                    "user_id": profile.user_id,
                    "subscription_type": "jobseeker",
                    "status": "active"
                },
                None,
            )
            .await
        {
            if let Some(obj) = profile_json.as_object_mut() {
                obj.insert("payment_id".to_string(), serde_json::json!(subscription.payment_id));
            }
        }

        profiles_with_user_data.push(profile_json);
    }

    let total = db.collection::<JobSeekerProfile>("job_seeker_profiles")
        .count_documents(filter, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Count error: {}", e)))?;

    Ok(Json(ApiResponse::success(serde_json::json!({
        "profiles": profiles_with_user_data,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total as f64 / limit as f64).ceil() as i64,
        }
    }))))
}

#[derive(serde::Deserialize, rocket_okapi::okapi::schemars::JsonSchema)]
pub struct UpdateJobSeekerVerificationDto {
    pub is_verified: bool,
    pub rejection_reason: Option<String>,
}

#[openapi(tag = "Admin - Job Seekers")]
#[put("/admin/job-seekers/<profile_id>/verify", data = "<dto>")]
pub async fn verify_job_seeker(
    db: &State<DbConn>,
    profile_id: String,
    dto: Json<UpdateJobSeekerVerificationDto>,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let object_id = ObjectId::parse_str(&profile_id)
        .map_err(|_| ApiError::bad_request("Invalid profile ID"))?;

    db.collection::<JobSeekerProfile>("job_seeker_profiles")
        .update_one(
            doc! { "_id": object_id },
            doc! { "$set": { "is_verified": dto.is_verified, "updated_at": DateTime::now() } },
            None
        )
        .await
        .map_err(|e| ApiError::internal_error(format!("Failed to update job seeker: {}", e)))?;

    Ok(Json(ApiResponse::success(serde_json::json!({
        "message": if dto.is_verified { "Job seeker verified successfully" } else { "Job seeker verification revoked" }
    }))))
}

// ==================== CATEGORY ADMIN ROUTES ====================

#[derive(serde::Deserialize, rocket_okapi::okapi::schemars::JsonSchema)]
pub struct CreateCategoryDto {
    pub name: String,
    pub description: Option<String>,
    pub icon: Option<String>,
    pub order: Option<i32>,
    pub is_active: Option<bool>,
}

#[openapi(tag = "Admin - Categories")]
#[post("/admin/categories", data = "<dto>")]
pub async fn create_category(
    db: &State<DbConn>,
    dto: Json<CreateCategoryDto>,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    // Categories are now derived from serviceCategory field in services
    // This endpoint just returns success with the category name as ID
    Ok(Json(ApiResponse::success_with_message(
        "Category created successfully (Note: Categories are auto-created when services are added)".to_string(),
        serde_json::json!({
            "id": dto.name.clone()
        })
    )))
}

#[openapi(tag = "Admin - Categories")]
#[put("/admin/categories/<category_id>", data = "<dto>")]
pub async fn update_category(
    db: &State<DbConn>,
    category_id: String,
    dto: Json<CreateCategoryDto>,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    // Update serviceCategory field for all services in this category
    let result = db.collection::<Service>("services")
        .update_many(
            doc! { "serviceCategory": &category_id },
            doc! { "$set": { "serviceCategory": &dto.name } },
            None
        )
        .await
        .map_err(|e| ApiError::internal_error(format!("Failed to update category: {}", e)))?;

    Ok(Json(ApiResponse::success(serde_json::json!({
        "message": format!("Category updated successfully ({} services affected)", result.modified_count)
    }))))
}

#[openapi(tag = "Admin - Categories")]
#[delete("/admin/categories/<category_id>")]
pub async fn delete_category(
    db: &State<DbConn>,
    category_id: String,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    // Delete all services with this serviceCategory
    let result = db.collection::<Service>("services")
        .delete_many(doc! { "serviceCategory": &category_id }, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Failed to delete category: {}", e)))?;

    Ok(Json(ApiResponse::success(serde_json::json!({
        "message": format!("Category deleted successfully ({} services removed)", result.deleted_count)
    }))))
}

// ==================== SUBCATEGORY ADMIN ROUTES ====================

#[derive(serde::Deserialize, rocket_okapi::okapi::schemars::JsonSchema)]
pub struct CreateSubcategoryDto {
    pub main_category_id: String, // This is now serviceCategory
    pub name: String, // This is the service name
    pub description: Option<String>,
    pub order: Option<i32>,
    pub is_active: Option<bool>,
    pub price: Option<String>,
    pub rating: Option<String>,
    pub icon: Option<String>,
    pub color: Option<String>,
}

#[openapi(tag = "Admin - Categories")]
#[post("/admin/subcategories", data = "<dto>")]
pub async fn create_subcategory(
    db: &State<DbConn>,
    dto: Json<CreateSubcategoryDto>,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    // Create a new service
    let service = Service {
        id: ObjectId::new(),
        service_id: format!("SRV-{}", ObjectId::new().to_hex()),
        name: dto.name.clone(),
        service_category: dto.main_category_id.clone(),
        price: dto.price.clone().unwrap_or_else(|| "0".to_string()),
        rating: dto.rating.clone().unwrap_or_else(|| "0.0".to_string()),
        description: dto.description.clone().unwrap_or_default(),
        icon: dto.icon.clone().unwrap_or_default(),
        color: dto.color.clone().unwrap_or_else(|| "#0EA5E9".to_string()),
    };

    let result = db.collection::<Service>("services")
        .insert_one(&service, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Failed to create service: {}", e)))?;

    Ok(Json(ApiResponse::success_with_message(
        "Service (subcategory) created successfully".to_string(),
        serde_json::json!({
            "id": result.inserted_id.as_object_id().unwrap().to_hex()
        })
    )))
}

#[openapi(tag = "Admin - Categories")]
#[put("/admin/subcategories/<subcategory_id>", data = "<dto>")]
pub async fn update_subcategory(
    db: &State<DbConn>,
    subcategory_id: String,
    dto: Json<CreateSubcategoryDto>,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let object_id = ObjectId::parse_str(&subcategory_id)
        .map_err(|_| ApiError::bad_request("Invalid service ID"))?;

    let mut update_doc = doc! {
        "name": &dto.name,
        "serviceCategory": &dto.main_category_id,
    };

    if let Some(ref desc) = dto.description {
        update_doc.insert("description", desc);
    }
    if let Some(ref price) = dto.price {
        update_doc.insert("price", price);
    }
    if let Some(ref rating) = dto.rating {
        update_doc.insert("rating", rating);
    }
    if let Some(ref icon) = dto.icon {
        update_doc.insert("icon", icon);
    }
    if let Some(ref color) = dto.color {
        update_doc.insert("color", color);
    }

    db.collection::<Service>("services")
        .update_one(
            doc! { "_id": object_id },
            doc! { "$set": update_doc },
            None
        )
        .await
        .map_err(|e| ApiError::internal_error(format!("Failed to update service: {}", e)))?;

    Ok(Json(ApiResponse::success(serde_json::json!({
        "message": "Service (subcategory) updated successfully"
    }))))
}

#[openapi(tag = "Admin - Categories")]
#[delete("/admin/subcategories/<subcategory_id>")]
pub async fn delete_subcategory(
    db: &State<DbConn>,
    subcategory_id: String,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let object_id = ObjectId::parse_str(&subcategory_id)
        .map_err(|_| ApiError::bad_request("Invalid service ID"))?;

    db.collection::<Service>("services")
        .delete_one(doc! { "_id": object_id }, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Failed to delete service: {}", e)))?;

    Ok(Json(ApiResponse::success(serde_json::json!({
        "message": "Service (subcategory) deleted successfully"
    }))))
}

// ==================== JOBS ADMIN ROUTES ====================

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Job {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    pub title: String,
    pub company: Option<String>,
    pub description: Option<String>,
    pub location: Option<String>,
    pub job_type: Option<String>,
    pub category: Option<String>,
    pub salary_min: Option<f64>,
    pub salary_max: Option<f64>,
    pub requirements: Option<Vec<String>>,
    pub status: String,
    pub rejection_reason: Option<String>,
    pub applications_count: i32,
    pub posted_by: Option<ObjectId>,
    pub created_at: DateTime,
    pub updated_at: DateTime,
}

#[derive(FromForm, serde::Deserialize, rocket_okapi::okapi::schemars::JsonSchema)]
pub struct JobListQuery {
    pub status: Option<String>,
    pub page: Option<i64>,
    pub limit: Option<i64>,
}

#[openapi(tag = "Admin - Jobs")]
#[get("/admin/jobs?<query..>")]
pub async fn get_all_jobs(
    db: &State<DbConn>,
    query: JobListQuery,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(20).min(100);
    let skip = (page - 1) * limit;

    let mut filter = doc! {};
    if let Some(status) = query.status {
        filter.insert("status", status);
    }

    let find_options = FindOptions::builder()
        .skip(skip as u64)
        .limit(limit)
        .sort(doc! { "created_at": -1 })
        .build();

    let mut cursor = db.collection::<Job>("jobs")
        .find(filter.clone(), find_options)
        .await
        .map_err(|e| ApiError::internal_error(format!("Database error: {}", e)))?;

    let mut jobs = Vec::new();
    while cursor.advance().await.map_err(|e| ApiError::internal_error(format!("Cursor error: {}", e)))? {
        let job = cursor.deserialize_current()
            .map_err(|e| ApiError::internal_error(format!("Deserialization error: {}", e)))?;
        jobs.push(job);
    }

    let total = db.collection::<Job>("jobs")
        .count_documents(filter, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Count error: {}", e)))?;

    Ok(Json(ApiResponse::success(serde_json::json!({
        "jobs": jobs,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total as f64 / limit as f64).ceil() as i64,
        }
    }))))
}

#[derive(serde::Deserialize, rocket_okapi::okapi::schemars::JsonSchema)]
pub struct CreateJobDto {
    pub title: String,
    pub company: Option<String>,
    pub description: Option<String>,
    pub location: Option<String>,
    pub job_type: Option<String>,
    pub category: Option<String>,
    pub salary_min: Option<f64>,
    pub salary_max: Option<f64>,
    pub requirements: Option<Vec<String>>,
}

#[derive(serde::Deserialize, rocket_okapi::okapi::schemars::JsonSchema)]
pub struct UpdateJobStatusDto {
    pub status: String,
    pub rejection_reason: Option<String>,
}

#[openapi(tag = "Admin - Jobs")]
#[post("/admin/jobs", data = "<dto>")]
pub async fn create_job(
    db: &State<DbConn>,
    dto: Json<CreateJobDto>,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let job = Job {
        id: None,
        title: dto.title.clone(),
        company: dto.company.clone(),
        description: dto.description.clone(),
        location: dto.location.clone(),
        job_type: dto.job_type.clone(),
        category: dto.category.clone(),
        salary_min: dto.salary_min,
        salary_max: dto.salary_max,
        requirements: dto.requirements.clone(),
        status: "active".to_string(),
        rejection_reason: None,
        applications_count: 0,
        posted_by: None,
        created_at: DateTime::now(),
        updated_at: DateTime::now(),
    };

    let result = db.collection::<Job>("jobs")
        .insert_one(&job, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Failed to create job: {}", e)))?;

    Ok(Json(ApiResponse::success_with_message(
        "Job created successfully".to_string(),
        serde_json::json!({
            "id": result.inserted_id.as_object_id().unwrap().to_hex()
        })
    )))
}

#[openapi(tag = "Admin - Jobs")]
#[put("/admin/jobs/<job_id>/status", data = "<dto>")]
pub async fn update_job_status(
    db: &State<DbConn>,
    job_id: String,
    dto: Json<UpdateJobStatusDto>,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let object_id = ObjectId::parse_str(&job_id)
        .map_err(|_| ApiError::bad_request("Invalid job ID"))?;

    let mut update_doc = doc! {
        "status": &dto.status,
        "updated_at": DateTime::now(),
    };

    if let Some(ref reason) = dto.rejection_reason {
        update_doc.insert("rejection_reason", reason);
    }

    db.collection::<Job>("jobs")
        .update_one(
            doc! { "_id": object_id },
            doc! { "$set": update_doc },
            None
        )
        .await
        .map_err(|e| ApiError::internal_error(format!("Failed to update job: {}", e)))?;

    Ok(Json(ApiResponse::success(serde_json::json!({
        "message": format!("Job status updated to {}", dto.status)
    }))))
}

#[openapi(tag = "Admin - Jobs")]
#[delete("/admin/jobs/<job_id>")]
pub async fn delete_job(
    db: &State<DbConn>,
    job_id: String,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let object_id = ObjectId::parse_str(&job_id)
        .map_err(|_| ApiError::bad_request("Invalid job ID"))?;

    db.collection::<Job>("jobs")
        .delete_one(doc! { "_id": object_id }, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Failed to delete job: {}", e)))?;

    Ok(Json(ApiResponse::success(serde_json::json!({
        "message": "Job deleted successfully"
    }))))
}

// ==================== USER ADMIN ROUTES ====================

#[derive(FromForm, serde::Deserialize, rocket_okapi::okapi::schemars::JsonSchema)]
pub struct UserListQuery {
    pub is_active: Option<bool>,
    pub page: Option<i64>,
    pub limit: Option<i64>,
    pub search: Option<String>,
}

#[openapi(tag = "Admin - Users")]
#[get("/admin/users?<query..>")]
pub async fn get_all_users(
    db: &State<DbConn>,
    query: UserListQuery,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(20).min(100);
    let skip = (page - 1) * limit;

    let mut filter = doc! {};

    if let Some(is_active) = query.is_active {
        filter.insert("is_active", is_active);
    }

    if let Some(ref search_term) = query.search {
        if !search_term.is_empty() {
            filter.insert("$or", vec![
                doc! { "name": { "$regex": search_term, "$options": "i" } },
                doc! { "mobile": { "$regex": search_term, "$options": "i" } },
                doc! { "email": { "$regex": search_term, "$options": "i" } },
            ]);
        }
    }

    let find_options = FindOptions::builder()
        .skip(skip as u64)
        .limit(limit)
        .sort(doc! { "created_at": -1 })
        .build();

    let mut cursor = db.collection::<User>("users")
        .find(filter.clone(), find_options)
        .await
        .map_err(|e| ApiError::internal_error(format!("Database error: {}", e)))?;

    let mut users = Vec::new();
    while cursor.advance().await.map_err(|e| ApiError::internal_error(format!("Cursor error: {}", e)))? {
        let user = cursor.deserialize_current()
            .map_err(|e| ApiError::internal_error(format!("Deserialization error: {}", e)))?;
        users.push(user);
    }

    let total = db.collection::<User>("users")
        .count_documents(filter, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Count error: {}", e)))?;

    Ok(Json(ApiResponse::success(serde_json::json!({
        "users": users,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total as f64 / limit as f64).ceil() as i64,
        }
    }))))
}

#[openapi(tag = "Admin - Users")]
#[get("/admin/users/<user_id>")]
pub async fn get_user_by_id(
    db: &State<DbConn>,
    user_id: String,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let object_id = ObjectId::parse_str(&user_id)
        .map_err(|_| ApiError::bad_request("Invalid user ID"))?;

    let user = db.collection::<User>("users")
        .find_one(doc! { "_id": object_id }, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Database error: {}", e)))?
        .ok_or_else(|| ApiError::not_found("User not found"))?;

    Ok(Json(ApiResponse::success(serde_json::to_value(&user)
        .map_err(|e| ApiError::internal_error(format!("Serialization error: {}", e)))?)))
}

#[derive(serde::Deserialize, rocket_okapi::okapi::schemars::JsonSchema)]
pub struct UpdateUserDto {
    pub name: Option<String>,
    pub email: Option<String>,
    pub city: Option<String>,
    pub pincode: Option<String>,
    pub is_active: Option<bool>,
}

#[openapi(tag = "Admin - Users")]
#[put("/admin/users/<user_id>", data = "<dto>")]
pub async fn update_user(
    db: &State<DbConn>,
    user_id: String,
    dto: Json<UpdateUserDto>,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let object_id = ObjectId::parse_str(&user_id)
        .map_err(|_| ApiError::bad_request("Invalid user ID"))?;

    let mut update_doc = doc! {
        "updated_at": DateTime::now(),
    };

    if let Some(ref name) = dto.name {
        update_doc.insert("name", name);
    }
    if let Some(ref email) = dto.email {
        update_doc.insert("email", email);
    }
    if let Some(ref city) = dto.city {
        update_doc.insert("city", city);
    }
    if let Some(ref pincode) = dto.pincode {
        update_doc.insert("pincode", pincode);
    }
    if let Some(is_active) = dto.is_active {
        update_doc.insert("is_active", is_active);
    }

    db.collection::<User>("users")
        .update_one(
            doc! { "_id": object_id },
            doc! { "$set": update_doc },
            None
        )
        .await
        .map_err(|e| ApiError::internal_error(format!("Failed to update user: {}", e)))?;

    Ok(Json(ApiResponse::success(serde_json::json!({
        "message": "User updated successfully"
    }))))
}

#[openapi(tag = "Admin - Users")]
#[delete("/admin/users/<user_id>")]
pub async fn delete_user(
    db: &State<DbConn>,
    user_id: String,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let object_id = ObjectId::parse_str(&user_id)
        .map_err(|_| ApiError::bad_request("Invalid user ID"))?;

    // Soft delete - set is_active to false
    db.collection::<User>("users")
        .update_one(
            doc! { "_id": object_id },
            doc! { "$set": { "is_active": false, "updated_at": DateTime::now() } },
            None
        )
        .await
        .map_err(|e| ApiError::internal_error(format!("Failed to delete user: {}", e)))?;

    Ok(Json(ApiResponse::success(serde_json::json!({
        "message": "User deleted successfully"
    }))))
}

// ==================== WORKER PROFILE ADMIN ROUTES ====================

#[openapi(tag = "Admin - Workers")]
#[get("/admin/workers/<worker_id>")]
pub async fn get_worker_by_id(
    db: &State<DbConn>,
    worker_id: String,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let object_id = ObjectId::parse_str(&worker_id)
        .map_err(|_| ApiError::bad_request("Invalid worker ID"))?;

    let worker = db.collection::<WorkerProfile>("worker_profiles")
        .find_one(doc! { "_id": object_id }, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Database error: {}", e)))?
        .ok_or_else(|| ApiError::not_found("Worker profile not found"))?;

    Ok(Json(ApiResponse::success(serde_json::to_value(&worker)
        .map_err(|e| ApiError::internal_error(format!("Serialization error: {}", e)))?)))
}

#[derive(serde::Deserialize, rocket_okapi::okapi::schemars::JsonSchema)]
pub struct UpdateWorkerDto {
    pub categories: Option<Vec<String>>,
    pub subcategories: Option<Vec<String>>,
    pub experience_years: Option<i32>,
    pub description: Option<String>,
    pub hourly_rate: Option<f64>,
    pub license_number: Option<String>,
    pub service_areas: Option<Vec<String>>,
    pub is_verified: Option<bool>,
    pub is_available: Option<bool>,
}

#[openapi(tag = "Admin - Workers")]
#[put("/admin/workers/<worker_id>", data = "<dto>")]
pub async fn update_worker(
    db: &State<DbConn>,
    worker_id: String,
    dto: Json<UpdateWorkerDto>,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let object_id = ObjectId::parse_str(&worker_id)
        .map_err(|_| ApiError::bad_request("Invalid worker ID"))?;

    let mut update_doc = doc! {
        "updated_at": DateTime::now(),
    };

    if let Some(ref categories) = dto.categories {
        update_doc.insert("categories", categories);
    }
    if let Some(ref subcategories) = dto.subcategories {
        update_doc.insert("subcategories", subcategories);
    }
    if let Some(experience_years) = dto.experience_years {
        update_doc.insert("experience_years", experience_years);
    }
    if let Some(ref description) = dto.description {
        update_doc.insert("description", description);
    }
    if let Some(hourly_rate) = dto.hourly_rate {
        update_doc.insert("hourly_rate", hourly_rate);
    }
    if let Some(ref license_number) = dto.license_number {
        update_doc.insert("license_number", license_number);
    }
    if let Some(ref service_areas) = dto.service_areas {
        update_doc.insert("service_areas", service_areas);
    }
    if let Some(is_verified) = dto.is_verified {
        update_doc.insert("is_verified", is_verified);
    }
    if let Some(is_available) = dto.is_available {
        update_doc.insert("is_available", is_available);
    }

    db.collection::<WorkerProfile>("worker_profiles")
        .update_one(
            doc! { "_id": object_id },
            doc! { "$set": update_doc },
            None
        )
        .await
        .map_err(|e| ApiError::internal_error(format!("Failed to update worker: {}", e)))?;

    Ok(Json(ApiResponse::success(serde_json::json!({
        "message": "Worker profile updated successfully"
    }))))
}

#[openapi(tag = "Admin - Workers")]
#[delete("/admin/workers/<worker_id>")]
pub async fn delete_worker(
    db: &State<DbConn>,
    worker_id: String,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let object_id = ObjectId::parse_str(&worker_id)
        .map_err(|_| ApiError::bad_request("Invalid worker ID"))?;

    db.collection::<WorkerProfile>("worker_profiles")
        .delete_one(doc! { "_id": object_id }, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Failed to delete worker: {}", e)))?;

    Ok(Json(ApiResponse::success(serde_json::json!({
        "message": "Worker profile deleted successfully"
    }))))
}

// ==================== RAZORPAY PAYMENT INFO ====================

#[openapi(tag = "Admin - Razorpay")]
#[get("/admin/razorpay/payment/<payment_id>")]
pub async fn get_razorpay_payment(
    payment_id: String,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let key_id = std::env::var("RAZORPAY_KEY_ID")
        .map_err(|_| ApiError::internal_error("Missing Razorpay key ID"))?;
    let key_secret = std::env::var("RAZORPAY_KEY_SECRET")
        .map_err(|_| ApiError::internal_error("Missing Razorpay key secret"))?;

    let client = Client::new();
    let url = format!("https://api.razorpay.com/v1/payments/{}", payment_id);

    let response = client
        .get(&url)
        .basic_auth(&key_id, Some(&key_secret))
        .send()
        .await
        .map_err(|e| ApiError::internal_error(format!("Failed to fetch payment: {}", e)))?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        return Err(ApiError::internal_error(format!(
            "Razorpay API error ({}): {}",
            status, body
        )));
    }

    let payment_data: serde_json::Value = response
        .json()
        .await
        .map_err(|e| ApiError::internal_error(format!("Failed to parse payment response: {}", e)))?;

    Ok(Json(ApiResponse::success(payment_data)))
}

// ==================== SUBSCRIPTION ADMIN ROUTES ====================

#[derive(FromForm, serde::Deserialize, rocket_okapi::okapi::schemars::JsonSchema)]
pub struct SubscriptionListQuery {
    pub subscription_type: Option<String>,
    pub status: Option<String>,
    pub page: Option<i64>,
    pub limit: Option<i64>,
    pub search: Option<String>,
}

#[openapi(tag = "Admin - Subscriptions")]
#[get("/admin/subscriptions?<query..>")]
pub async fn get_all_subscriptions(
    db: &State<DbConn>,
    query: SubscriptionListQuery,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(20).min(100);
    let skip = (page - 1) * limit;

    let mut filter = doc! {};
    if let Some(ref sub_type) = query.subscription_type {
        filter.insert("subscription_type", sub_type);
    }
    if let Some(ref status) = query.status {
        filter.insert("status", status);
    }

    // If search is a pure number, filter by invoice_number directly in DB
    let invoice_number_search: Option<i64> = query.search.as_ref()
        .and_then(|s| s.trim().parse::<i64>().ok());

    if let Some(inv_num) = invoice_number_search {
        filter.insert("invoice_number", inv_num);
    }

    let find_options = FindOptions::builder()
        .skip(skip as u64)
        .limit(limit)
        .sort(doc! { "invoice_number": 1 })
        .build();

    let mut cursor = db.collection::<Subscription>("subscriptions")
        .find(filter.clone(), find_options)
        .await
        .map_err(|e| ApiError::internal_error(format!("Database error: {}", e)))?;

    let mut subscriptions = Vec::new();
    while cursor.advance().await.map_err(|e| ApiError::internal_error(format!("Cursor error: {}", e)))? {
        let sub = cursor.deserialize_current()
            .map_err(|e| ApiError::internal_error(format!("Deserialization error: {}", e)))?;
        subscriptions.push(sub);
    }

    // Enrich with user data
    let mut subscriptions_with_user_data = Vec::new();
    for sub in &subscriptions {
        let mut sub_json = serde_json::to_value(sub)
            .map_err(|e| ApiError::internal_error(format!("Serialization error: {}", e)))?;

        if let Ok(Some(user)) = db.collection::<User>("users")
            .find_one(doc! { "_id": sub.user_id }, None)
            .await
        {
            if let Some(obj) = sub_json.as_object_mut() {
                obj.insert("user_name".to_string(), serde_json::json!(user.name));
                obj.insert("user_mobile".to_string(), serde_json::json!(user.mobile));
                obj.insert("user_email".to_string(), serde_json::json!(user.email));
            }
        }

        subscriptions_with_user_data.push(sub_json);
    }

    // If search is provided (and not a pure number already handled above),
    // filter by user name/mobile/email
    let final_subscriptions = if let Some(ref search_term) = query.search {
        if !search_term.is_empty() && invoice_number_search.is_none() {
            let term = search_term.to_lowercase();
            subscriptions_with_user_data
                .into_iter()
                .filter(|s| {
                    let name = s.get("user_name").and_then(|v| v.as_str()).unwrap_or("");
                    let mobile = s.get("user_mobile").and_then(|v| v.as_str()).unwrap_or("");
                    let email = s.get("user_email").and_then(|v| v.as_str()).unwrap_or("");
                    let inv_num = s.get("invoice_number")
                        .and_then(|v| v.as_i64())
                        .map(|n| n.to_string())
                        .unwrap_or_default();
                    name.to_lowercase().contains(&term)
                        || mobile.contains(&term)
                        || email.to_lowercase().contains(&term)
                        || inv_num.contains(search_term.as_str())
                })
                .collect()
        } else {
            subscriptions_with_user_data
        }
    } else {
        subscriptions_with_user_data
    };

    let total = db.collection::<Subscription>("subscriptions")
        .count_documents(filter, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Count error: {}", e)))?;

    Ok(Json(ApiResponse::success(serde_json::json!({
        "subscriptions": final_subscriptions,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total as f64 / limit as f64).ceil() as i64,
        }
    }))))
}

#[derive(serde::Deserialize, rocket_okapi::okapi::schemars::JsonSchema)]
pub struct CreateSubscriptionDto {
    pub user_id: String,
    pub subscription_type: String,  // "worker" or "jobseeker"
    pub plan_name: String,          // "silver", "gold", "job_seeker_premium"
    pub price: f64,
    pub duration_days: Option<i64>, // defaults to 30
    pub payment_id: Option<String>,
    pub auto_renew: Option<bool>,
}

#[openapi(tag = "Admin - Subscriptions")]
#[post("/admin/subscriptions", data = "<dto>")]
pub async fn create_subscription(
    db: &State<DbConn>,
    dto: Json<CreateSubscriptionDto>,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let user_object_id = ObjectId::parse_str(&dto.user_id)
        .map_err(|_| ApiError::bad_request("Invalid user ID"))?;

    // Verify user exists
    db.collection::<User>("users")
        .find_one(doc! { "_id": user_object_id }, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Database error: {}", e)))?
        .ok_or_else(|| ApiError::not_found("User not found"))?;

    let subscription_type = match dto.subscription_type.to_lowercase().as_str() {
        "worker" => "worker",
        "jobseeker" | "job_seeker" => "jobseeker",
        _ => return Err(ApiError::bad_request("Invalid subscription type. Use 'worker' or 'jobseeker'")),
    };

    let now = DateTime::now();
    let duration_days = dto.duration_days.unwrap_or(30);
    let expires_at_millis = now.timestamp_millis() + (duration_days * 24 * 60 * 60 * 1000);
    let expires_at = DateTime::from_millis(expires_at_millis);

    // Auto-increment invoice number: find the current max and add 1
    let max_invoice = db.collection::<Subscription>("subscriptions")
        .find_one(
            doc! { "invoice_number": { "$exists": true } },
            mongodb::options::FindOneOptions::builder()
                .sort(doc! { "invoice_number": -1 })
                .build(),
        )
        .await
        .map_err(|e| ApiError::internal_error(format!("Database error: {}", e)))?;

    let next_invoice_number = max_invoice
        .and_then(|s| s.invoice_number)
        .unwrap_or(0) + 1;

    let subscription = Subscription {
        id: None,
        user_id: user_object_id,
        subscription_type: if subscription_type == "worker" {
            SubscriptionType::Worker
        } else {
            SubscriptionType::JobSeeker
        },
        plan_name: dto.plan_name.clone(),
        price: dto.price,
        status: SubscriptionStatus::Active,
        starts_at: now,
        expires_at,
        auto_renew: dto.auto_renew.unwrap_or(false),
        payment_id: dto.payment_id.clone(),
        invoice_number: Some(next_invoice_number),
        created_at: now,
        updated_at: now,
    };

    let result = db.collection::<Subscription>("subscriptions")
        .insert_one(&subscription, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Failed to create subscription: {}", e)))?;

    // Also update the user's subscription fields
    let mut user_update = doc! {
        "subscription_plan": &dto.plan_name,
        "subscription_id": result.inserted_id.as_object_id().unwrap(),
        "subscription_expires_at": expires_at,
        "updated_at": now,
    };

    db.collection::<User>("users")
        .update_one(
            doc! { "_id": user_object_id },
            doc! { "$set": user_update },
            None,
        )
        .await
        .map_err(|e| ApiError::internal_error(format!("Failed to update user subscription: {}", e)))?;

    // Update the corresponding profile's subscription fields
    if subscription_type == "worker" {
        let _ = db.collection::<WorkerProfile>("worker_profiles")
            .update_one(
                doc! { "user_id": user_object_id },
                doc! { "$set": {
                    "subscription_plan": &dto.plan_name,
                    "subscription_expires_at": expires_at,
                    "updated_at": now,
                }},
                None,
            )
            .await;
    } else {
        let _ = db.collection::<JobSeekerProfile>("job_seeker_profiles")
            .update_one(
                doc! { "user_id": user_object_id },
                doc! { "$set": {
                    "subscription_plan": &dto.plan_name,
                    "subscription_expires_at": expires_at,
                    "updated_at": now,
                }},
                None,
            )
            .await;
    }

    Ok(Json(ApiResponse::success_with_message(
        "Subscription created successfully".to_string(),
        serde_json::json!({
            "id": result.inserted_id.as_object_id().unwrap().to_hex(),
            "invoice_number": next_invoice_number
        })
    )))
}

#[derive(serde::Deserialize, rocket_okapi::okapi::schemars::JsonSchema)]
pub struct UpdateSubscriptionDto {
    pub plan_name: Option<String>,
    pub price: Option<f64>,
    pub status: Option<String>,          // "active", "expired", "cancelled", "pending"
    pub auto_renew: Option<bool>,
    pub duration_days: Option<i64>,      // Extend by N days from now
    pub payment_id: Option<String>,
}

#[openapi(tag = "Admin - Subscriptions")]
#[put("/admin/subscriptions/<subscription_id>", data = "<dto>")]
pub async fn update_subscription(
    db: &State<DbConn>,
    subscription_id: String,
    dto: Json<UpdateSubscriptionDto>,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let object_id = ObjectId::parse_str(&subscription_id)
        .map_err(|_| ApiError::bad_request("Invalid subscription ID"))?;

    let now = DateTime::now();
    let mut update_doc = doc! {
        "updated_at": now,
    };

    if let Some(ref plan_name) = dto.plan_name {
        update_doc.insert("plan_name", plan_name);
    }
    if let Some(price) = dto.price {
        update_doc.insert("price", price);
    }
    if let Some(ref status) = dto.status {
        update_doc.insert("status", status);
    }
    if let Some(auto_renew) = dto.auto_renew {
        update_doc.insert("auto_renew", auto_renew);
    }
    if let Some(ref payment_id) = dto.payment_id {
        update_doc.insert("payment_id", payment_id);
    }
    if let Some(duration_days) = dto.duration_days {
        let expires_at_millis = now.timestamp_millis() + (duration_days * 24 * 60 * 60 * 1000);
        let expires_at = DateTime::from_millis(expires_at_millis);
        update_doc.insert("expires_at", expires_at);
    }

    db.collection::<Subscription>("subscriptions")
        .update_one(
            doc! { "_id": object_id },
            doc! { "$set": update_doc },
            None
        )
        .await
        .map_err(|e| ApiError::internal_error(format!("Failed to update subscription: {}", e)))?;

    // Also sync changes to user/profile if plan_name or status changed
    if let Ok(Some(sub)) = db.collection::<Subscription>("subscriptions")
        .find_one(doc! { "_id": object_id }, None)
        .await
    {
        let mut user_update = doc! { "updated_at": now };

        if dto.plan_name.is_some() {
            user_update.insert("subscription_plan", &sub.plan_name);
        }
        if dto.duration_days.is_some() {
            user_update.insert("subscription_expires_at", sub.expires_at);
        }

        if !user_update.keys().collect::<Vec<_>>().is_empty() {
            let _ = db.collection::<User>("users")
                .update_one(
                    doc! { "_id": sub.user_id },
                    doc! { "$set": &user_update },
                    None,
                )
                .await;

            // Determine subscription type and update corresponding profile
            let sub_type = serde_json::to_value(&sub.subscription_type)
                .ok()
                .and_then(|v| v.as_str().map(|s| s.to_string()))
                .unwrap_or_default();

            if sub_type == "worker" {
                let _ = db.collection::<WorkerProfile>("worker_profiles")
                    .update_one(
                        doc! { "user_id": sub.user_id },
                        doc! { "$set": {
                            "subscription_plan": &sub.plan_name,
                            "subscription_expires_at": sub.expires_at,
                            "updated_at": now,
                        }},
                        None,
                    )
                    .await;
            } else {
                let _ = db.collection::<JobSeekerProfile>("job_seeker_profiles")
                    .update_one(
                        doc! { "user_id": sub.user_id },
                        doc! { "$set": {
                            "subscription_plan": &sub.plan_name,
                            "subscription_expires_at": sub.expires_at,
                            "updated_at": now,
                        }},
                        None,
                    )
                    .await;
            }
        }
    }

    Ok(Json(ApiResponse::success(serde_json::json!({
        "message": "Subscription updated successfully"
    }))))
}

#[openapi(tag = "Admin - Subscriptions")]
#[delete("/admin/subscriptions/<subscription_id>")]
pub async fn delete_subscription(
    db: &State<DbConn>,
    subscription_id: String,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let object_id = ObjectId::parse_str(&subscription_id)
        .map_err(|_| ApiError::bad_request("Invalid subscription ID"))?;

    // Fetch subscription before deleting to clean up user/profile fields
    if let Ok(Some(sub)) = db.collection::<Subscription>("subscriptions")
        .find_one(doc! { "_id": object_id }, None)
        .await
    {
        let now = DateTime::now();

        // Clear subscription fields on user
        let _ = db.collection::<User>("users")
            .update_one(
                doc! { "_id": sub.user_id },
                doc! { "$set": {
                    "subscription_plan": serde_json::Value::Null.to_string(),
                    "subscription_id": serde_json::Value::Null.to_string(),
                    "subscription_expires_at": serde_json::Value::Null.to_string(),
                    "updated_at": now,
                }},
                None,
            )
            .await;

        // Clear subscription fields on profile
        let sub_type = serde_json::to_value(&sub.subscription_type)
            .ok()
            .and_then(|v| v.as_str().map(|s| s.to_string()))
            .unwrap_or_default();

        if sub_type == "worker" {
            let _ = db.collection::<WorkerProfile>("worker_profiles")
                .update_one(
                    doc! { "user_id": sub.user_id },
                    doc! { "$set": {
                        "subscription_plan": "none",
                        "updated_at": now,
                    }, "$unset": {
                        "subscription_expires_at": "",
                    }},
                    None,
                )
                .await;
        } else {
            let _ = db.collection::<JobSeekerProfile>("job_seeker_profiles")
                .update_one(
                    doc! { "user_id": sub.user_id },
                    doc! { "$set": {
                        "subscription_plan": "free",
                        "updated_at": now,
                    }, "$unset": {
                        "subscription_expires_at": "",
                    }},
                    None,
                )
                .await;
        }
    }

    db.collection::<Subscription>("subscriptions")
        .delete_one(doc! { "_id": object_id }, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Failed to delete subscription: {}", e)))?;

    Ok(Json(ApiResponse::success(serde_json::json!({
        "message": "Subscription deleted successfully"
    }))))
}

// ==================== ADMIN SERVICES CRUD ROUTES ====================

#[derive(FromForm, serde::Deserialize, rocket_okapi::okapi::schemars::JsonSchema)]
pub struct ServiceListQuery {
    pub page: Option<i64>,
    pub limit: Option<i64>,
    pub search: Option<String>,
    pub category: Option<String>,
}

#[openapi(tag = "Admin - Services")]
#[get("/admin/services?<query..>")]
pub async fn get_all_services_admin(
    db: &State<DbConn>,
    query: ServiceListQuery,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(50).min(200);
    let skip = (page - 1) * limit;

    let mut filter = doc! {};
    if let Some(ref category) = query.category {
        if !category.is_empty() {
            filter.insert("serviceCategory", category);
        }
    }
    if let Some(ref search_term) = query.search {
        if !search_term.is_empty() {
            filter.insert("$or", vec![
                doc! { "name": { "$regex": search_term, "$options": "i" } },
                doc! { "description": { "$regex": search_term, "$options": "i" } },
                doc! { "serviceCategory": { "$regex": search_term, "$options": "i" } },
            ]);
        }
    }

    let find_options = FindOptions::builder()
        .skip(skip as u64)
        .limit(limit)
        .sort(doc! { "serviceCategory": 1, "name": 1 })
        .build();

    let mut cursor = db.collection::<Service>("services")
        .find(filter.clone(), find_options)
        .await
        .map_err(|e| ApiError::internal_error(format!("Database error: {}", e)))?;

    let mut services = Vec::new();
    while cursor.advance().await.map_err(|e| ApiError::internal_error(format!("Cursor error: {}", e)))? {
        let service = cursor.deserialize_current()
            .map_err(|e| ApiError::internal_error(format!("Deserialization error: {}", e)))?;
        services.push(service);
    }

    let total = db.collection::<Service>("services")
        .count_documents(filter, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Count error: {}", e)))?;

    // Get all unique categories for filter dropdown
    let categories = db.collection::<Service>("services")
        .distinct("serviceCategory", None, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Database error: {}", e)))?;

    let category_list: Vec<String> = categories
        .iter()
        .filter_map(|b| b.as_str().map(|s| s.to_string()))
        .collect();

    Ok(Json(ApiResponse::success(serde_json::json!({
        "services": services,
        "categories": category_list,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total as f64 / limit as f64).ceil() as i64,
        }
    }))))
}

#[derive(serde::Deserialize, rocket_okapi::okapi::schemars::JsonSchema)]
pub struct CreateServiceDto {
    pub name: String,
    pub service_category: String,
    pub price: Option<String>,
    pub description: Option<String>,
    pub icon: Option<String>,
    pub color: Option<String>,
    pub rating: Option<String>,
}

#[openapi(tag = "Admin - Services")]
#[post("/admin/services", data = "<dto>")]
pub async fn create_service_admin(
    db: &State<DbConn>,
    dto: Json<CreateServiceDto>,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let service = Service {
        id: ObjectId::new(),
        service_id: format!("SRV-{}", ObjectId::new().to_hex()),
        name: dto.name.clone(),
        service_category: dto.service_category.clone(),
        price: dto.price.clone().unwrap_or_else(|| "0".to_string()),
        rating: dto.rating.clone().unwrap_or_else(|| "0.0".to_string()),
        description: dto.description.clone().unwrap_or_default(),
        icon: dto.icon.clone().unwrap_or_default(),
        color: dto.color.clone().unwrap_or_else(|| "#0EA5E9".to_string()),
    };

    let result = db.collection::<Service>("services")
        .insert_one(&service, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Failed to create service: {}", e)))?;

    Ok(Json(ApiResponse::success_with_message(
        "Service created successfully".to_string(),
        serde_json::json!({
            "id": result.inserted_id.as_object_id().unwrap().to_hex()
        })
    )))
}

#[openapi(tag = "Admin - Services")]
#[put("/admin/services/<service_id>", data = "<dto>")]
pub async fn update_service_admin(
    db: &State<DbConn>,
    service_id: String,
    dto: Json<CreateServiceDto>,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let object_id = ObjectId::parse_str(&service_id)
        .map_err(|_| ApiError::bad_request("Invalid service ID"))?;

    let mut update_doc = doc! {
        "name": &dto.name,
        "serviceCategory": &dto.service_category,
    };

    if let Some(ref desc) = dto.description {
        update_doc.insert("description", desc);
    }
    if let Some(ref price) = dto.price {
        update_doc.insert("price", price);
    }
    if let Some(ref rating) = dto.rating {
        update_doc.insert("rating", rating);
    }
    if let Some(ref icon) = dto.icon {
        update_doc.insert("icon", icon);
    }
    if let Some(ref color) = dto.color {
        update_doc.insert("color", color);
    }

    db.collection::<Service>("services")
        .update_one(
            doc! { "_id": object_id },
            doc! { "$set": update_doc },
            None
        )
        .await
        .map_err(|e| ApiError::internal_error(format!("Failed to update service: {}", e)))?;

    Ok(Json(ApiResponse::success(serde_json::json!({
        "message": "Service updated successfully"
    }))))
}

#[openapi(tag = "Admin - Services")]
#[delete("/admin/services/<service_id>")]
pub async fn delete_service_admin(
    db: &State<DbConn>,
    service_id: String,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let object_id = ObjectId::parse_str(&service_id)
        .map_err(|_| ApiError::bad_request("Invalid service ID"))?;

    db.collection::<Service>("services")
        .delete_one(doc! { "_id": object_id }, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Failed to delete service: {}", e)))?;

    Ok(Json(ApiResponse::success(serde_json::json!({
        "message": "Service deleted successfully"
    }))))
}