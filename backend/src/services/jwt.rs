use jsonwebtoken::{encode, decode, Header, Validation, EncodingKey, DecodingKey};
use serde::{Deserialize, Serialize};
use mongodb::bson::oid::ObjectId;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,  // User ID
    pub mobile: String,
    pub exp: i64,
    pub iat: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AdminClaims {
    pub sub: String,  // Admin ID
    pub email: String,
    pub is_admin: bool,
    pub exp: i64,
    pub iat: i64,
}

pub struct JwtService;

impl JwtService {
    pub fn generate_access_token(user_id: &ObjectId, mobile: &str) -> Result<String, jsonwebtoken::errors::Error> {
        let expiry = crate::config::Config::jwt_expiry();
        let now = chrono::Utc::now().timestamp();

        let claims = Claims {
            sub: user_id.to_hex(),
            mobile: mobile.to_string(),
            exp: now + expiry,
            iat: now,
        };

        let secret = crate::config::Config::jwt_secret();
        encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(secret.as_bytes()),
        )
    }

    pub fn generate_refresh_token(user_id: &ObjectId, mobile: &str) -> Result<String, jsonwebtoken::errors::Error> {
        let expiry = crate::config::Config::jwt_refresh_expiry();
        let now = chrono::Utc::now().timestamp();

        let claims = Claims {
            sub: user_id.to_hex(),
            mobile: mobile.to_string(),
            exp: now + expiry,
            iat: now,
        };

        let secret = crate::config::Config::jwt_refresh_secret();
        encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(secret.as_bytes()),
        )
    }

    pub fn verify_token(token: &str, is_refresh: bool) -> Result<Claims, jsonwebtoken::errors::Error> {
        let secret = if is_refresh {
            crate::config::Config::jwt_refresh_secret()
        } else {
            crate::config::Config::jwt_secret()
        };

        let token_data = decode::<Claims>(
            token,
            &DecodingKey::from_secret(secret.as_bytes()),
            &Validation::default(),
        )?;

        Ok(token_data.claims)
    }

    // ==================== ADMIN TOKEN METHODS ====================

    pub fn generate_admin_access_token(admin_id: &ObjectId, email: &str) -> Result<String, jsonwebtoken::errors::Error> {
        let expiry = crate::config::Config::jwt_expiry();
        let now = chrono::Utc::now().timestamp();

        let claims = AdminClaims {
            sub: admin_id.to_hex(),
            email: email.to_string(),
            is_admin: true,
            exp: now + expiry,
            iat: now,
        };

        let secret = crate::config::Config::jwt_secret();
        encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(secret.as_bytes()),
        )
    }

    pub fn generate_admin_refresh_token(admin_id: &ObjectId, email: &str) -> Result<String, jsonwebtoken::errors::Error> {
        let expiry = crate::config::Config::jwt_refresh_expiry();
        let now = chrono::Utc::now().timestamp();

        let claims = AdminClaims {
            sub: admin_id.to_hex(),
            email: email.to_string(),
            is_admin: true,
            exp: now + expiry,
            iat: now,
        };

        let secret = crate::config::Config::jwt_refresh_secret();
        encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(secret.as_bytes()),
        )
    }

    pub fn verify_admin_token(token: &str, is_refresh: bool) -> Result<AdminClaims, jsonwebtoken::errors::Error> {
        let secret = if is_refresh {
            crate::config::Config::jwt_refresh_secret()
        } else {
            crate::config::Config::jwt_secret()
        };

        let token_data = decode::<AdminClaims>(
            token,
            &DecodingKey::from_secret(secret.as_bytes()),
            &Validation::default(),
        )?;

        // Verify this is an admin token
        if !token_data.claims.is_admin {
            return Err(jsonwebtoken::errors::Error::from(
                jsonwebtoken::errors::ErrorKind::InvalidToken
            ));
        }

        Ok(token_data.claims)
    }
}
