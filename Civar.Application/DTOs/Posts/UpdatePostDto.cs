﻿using System.ComponentModel.DataAnnotations;

namespace Civar.Application.DTOs.Posts
{
    public class UpdatePostDto
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
    }
}