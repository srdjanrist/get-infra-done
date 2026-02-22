# ECS Fargate Terraform Template

ECS Fargate service with ALB, auto-scaling, and CloudWatch.

## ECS Cluster & Service

```hcl
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-cluster"
  }
}

resource "aws_ecs_task_definition" "{service_name}" {
  family                   = "${var.project_name}-${var.environment}-{service_name}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = {cpu}
  memory                   = {memory}
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name  = "{service_name}"
    image = "{ecr_repo_url}:latest"
    portMappings = [{
      containerPort = {container_port}
      protocol      = "tcp"
    }]
    environment = [
      {
        name  = "NODE_ENV"
        value = var.environment
      }
    ]
    secrets = [
      {
        name      = "DATABASE_URL"
        valueFrom = aws_secretsmanager_secret.database_url.arn
      }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.{service_name}.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
    healthCheck = {
      command     = ["CMD-SHELL", "curl -f http://localhost:{container_port}/health || exit 1"]
      interval    = 30
      timeout     = 5
      retries     = 3
      startPeriod = 60
    }
  }])
}

resource "aws_ecs_service" "{service_name}" {
  name            = "{service_name}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.{service_name}.arn
  desired_count   = {desired_count}
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs_{service_name}.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.{service_name}.arn
    container_name   = "{service_name}"
    container_port   = {container_port}
  }

  depends_on = [aws_lb_listener.https]
}

# ─── Application Load Balancer ───────────────────────────────────────────────

resource "aws_lb" "main" {
  name               = "${var.project_name}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  tags = {
    Name = "${var.project_name}-${var.environment}-alb"
  }
}

resource "aws_lb_target_group" "{service_name}" {
  name        = "${var.project_name}-${var.environment}-{service_name}"
  port        = {container_port}
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 3
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    timeout             = 5
    unhealthy_threshold = 3
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.{service_name}.arn
  }
}

resource "aws_lb_listener" "http_redirect" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# ─── Auto Scaling ────────────────────────────────────────────────────────────

resource "aws_appautoscaling_target" "{service_name}" {
  max_capacity       = {max_count}
  min_capacity       = {min_count}
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.{service_name}.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "{service_name}_cpu" {
  name               = "${var.project_name}-${var.environment}-{service_name}-cpu"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.{service_name}.resource_id
  scalable_dimension = aws_appautoscaling_target.{service_name}.scalable_dimension
  service_namespace  = aws_appautoscaling_target.{service_name}.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}

# ─── CloudWatch Logs ─────────────────────────────────────────────────────────

resource "aws_cloudwatch_log_group" "{service_name}" {
  name              = "/ecs/${var.project_name}-${var.environment}/{service_name}"
  retention_in_days = 30
}
```

## Notes

- Tasks run in private subnets, only accessible via ALB.
- Container Insights enabled for detailed ECS metrics.
- HTTPS enforced with HTTP→HTTPS redirect.
- Auto-scaling based on CPU utilization at 70% target.
- Health check endpoint assumed at `/health`.
