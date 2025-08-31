using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Civar.Application.DTOs.Auth
{
    public class SendVerificationCodeDto
    {
        public string Email { get; set; } = string.Empty;
        public bool IsGoogleUser { get; set; }
    }
}
