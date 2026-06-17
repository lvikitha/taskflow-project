package com.taskflow.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI / Swagger configuration.
 * Access docs at: http://localhost:8080/api/swagger-ui.html
 */
@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "TaskFlow API",
        version = "1.0.0",
        description = "AI-Powered Task Management Portal — REST API Documentation",
        contact = @Contact(name = "TaskFlow Team")
    )
)
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT",
    description = "Enter JWT token obtained from /api/auth/login"
)
public class OpenApiConfig {
}
