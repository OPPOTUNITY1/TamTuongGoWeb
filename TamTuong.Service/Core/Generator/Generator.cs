using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;

namespace TamTuong.Service.Core.Generator
{
    public class Generator
    {
        public static string Base64FromBytes(int length)
        {
            var randomNumber = new byte[length];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

    }
}
