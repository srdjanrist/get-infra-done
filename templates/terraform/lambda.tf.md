# Lambda Terraform Template

Lambda function with API Gateway, IAM role, and CloudWatch.

## Lambda Configuration

```hcl
data "archive_file" "{function_name}" {
  type        = "zip"
  source_dir  = "{source_dir}"
  output_path = "${path.module}/builds/{function_name}.zip"
}

resource "aws_lambda_function" "{function_name}" {
  function_name = "${var.project_name}-${var.environment}-{function_name}"
  filename      = data.archive_file.{function_name}.output_path
  handler       = "{handler}"  # e.g., "index.handler", "main.lambda_handler"
  runtime       = "{runtime}"  # e.g., "nodejs20.x", "python3.12"
  role          = aws_iam_role.lambda_{function_name}.arn

  source_code_hash = data.archive_file.{function_name}.output_base64sha256

  memory_size = {memory_mb}   # 128-10240
  timeout     = {timeout_sec}  # 1-900

  environment {
    variables = {
      ENVIRONMENT = var.environment
    }
  }

  vpc_config {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda_{function_name}.id]
  }

  tracing_config {
    mode = "Active"
  }

  tags = {
    Name    = "${var.project_name}-${var.environment}-{function_name}"
    Service = "{function_name}"
  }
}

# ─── IAM Role ────────────────────────────────────────────────────────────────

resource "aws_iam_role" "lambda_{function_name}" {
  name = "${var.project_name}-${var.environment}-lambda-{function_name}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_{function_name}_basic" {
  role       = aws_iam_role.lambda_{function_name}.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# ─── API Gateway ─────────────────────────────────────────────────────────────

resource "aws_apigatewayv2_api" "{function_name}" {
  name          = "${var.project_name}-${var.environment}-{function_name}-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_headers = ["Content-Type", "Authorization"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_origins = ["*"]
    max_age       = 3600
  }
}

resource "aws_apigatewayv2_stage" "{function_name}" {
  api_id      = aws_apigatewayv2_api.{function_name}.id
  name        = var.environment
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_{function_name}.arn
  }
}

resource "aws_apigatewayv2_integration" "{function_name}" {
  api_id                 = aws_apigatewayv2_api.{function_name}.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.{function_name}.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "{function_name}" {
  api_id    = aws_apigatewayv2_api.{function_name}.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.{function_name}.id}"
}

resource "aws_lambda_permission" "api_{function_name}" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.{function_name}.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.{function_name}.execution_arn}/*/*"
}

# ─── CloudWatch Logs ─────────────────────────────────────────────────────────

resource "aws_cloudwatch_log_group" "lambda_{function_name}" {
  name              = "/aws/lambda/${var.project_name}-${var.environment}-{function_name}"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "api_{function_name}" {
  name              = "/aws/apigateway/${var.project_name}-${var.environment}-{function_name}"
  retention_in_days = 30
}

# ─── Security Group ──────────────────────────────────────────────────────────

resource "aws_security_group" "lambda_{function_name}" {
  name        = "${var.project_name}-${var.environment}-lambda-{function_name}-sg"
  description = "Security group for Lambda function"
  vpc_id      = aws_vpc.main.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-lambda-{function_name}-sg"
  }
}
```

## Notes

- X-Ray tracing enabled for distributed tracing.
- VPC-attached for accessing private resources (RDS, ElastiCache).
- HTTP API Gateway (v2) for lower latency and cost vs REST API.
- Memory/timeout should be tuned per function workload.
- Separate IAM role per function for least-privilege access.
