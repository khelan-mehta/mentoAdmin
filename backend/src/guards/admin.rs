use rocket::request::{self, FromRequest, Request, Outcome};
use rocket::http::Status;
use mongodb::bson::oid::ObjectId;

// === OpenAPI (compatible with rocket_okapi 0.8.0 / 0.8.1) ===
use rocket_okapi::request::{OpenApiFromRequest, RequestHeaderInput};
use rocket_okapi::r#gen::OpenApiGenerator;

/// JWT-based admin authentication guard
pub struct AdminGuard {
    pub admin_id: ObjectId,
    pub email: String,
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for AdminGuard {
    type Error = ();

    async fn from_request(req: &'r Request<'_>) -> request::Outcome<Self, Self::Error> {
        let token = req.headers().get_one("Authorization");

        match token {
            Some(token) => {
                let token = token.trim_start_matches("Bearer ");

                match crate::services::JwtService::verify_admin_token(token, false) {
                    Ok(claims) => match ObjectId::parse_str(&claims.sub) {
                        Ok(admin_id) => Outcome::Success(AdminGuard {
                            admin_id,
                            email: claims.email,
                        }),
                        Err(_) => Outcome::Error((Status::Unauthorized, ())),
                    },
                    Err(_) => Outcome::Error((Status::Unauthorized, ())),
                }
            }
            None => Outcome::Error((Status::Unauthorized, ())),
        }
    }
}

/// === OpenAPI Integration ===
impl<'a> OpenApiFromRequest<'a> for AdminGuard {
    fn from_request_input(
        _gen: &mut OpenApiGenerator,
        _name: String,
        _required: bool,
    ) -> rocket_okapi::Result<RequestHeaderInput> {
        Ok(RequestHeaderInput::None)
    }
}
