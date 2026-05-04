terraform {
  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
  }
}

provider "github" {
  owner = "CesarNog"
}

resource "github_repository" "site" {
  name        = "UP2CLOUD-website"
  visibility  = "public"
  description = "UP2CLOUD Website"
}

resource "github_repository_pages" "pages" {
  repository = github_repository.site.name
  build_type = "workflow"
}
