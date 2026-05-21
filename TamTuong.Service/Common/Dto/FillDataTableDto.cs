using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Text;

namespace TamTuong.Service.Common.Dto
{
    public class FillDataTableDto
    {
        public string? Col1 { get; set; }
        public string? Col2 { get; set; }
        public string? Col3 { get; set; }
        public string? Col4 { get; set; }
        public string? Col5 { get; set; }
        public string? Col6 { get; set; }
        public string? Col7 { get; set; }
        public string? Col8 { get; set; }
        public string? Col9 { get; set; }
    }


    public class RawItem
    {
        [DisplayName("Item Number")]
        public string? STT { get; set; }

        [DisplayName("Mark / Package")]
        public string? Mark { get; set; }

        [DisplayName("Goods Description")]
        public string? GoodsDescription { get; set; }

        [DisplayName("Origin Criterion")]
        public string? OriginCriterion { get; set; }

        [DisplayName("Quantity - Unit")]
        public string? Quantity_Unit { get; set; }

        [DisplayName("Gross Weight - Unit")]
        public string? GrossWeight_Unit { get; set; }

        [DisplayName("Package Quantity - Unit")]
        public string? PackageQuantity_Unit { get; set; }

        [DisplayName("HS MaBenhVien")]
        public string? HSCode { get; set; }

        [DisplayName("(VI) Commercial Invoices")]
        public string? Invoices_Table { get; set; }
        [DisplayName("Invoice Number")]
        public string? Invoice_Number { get; set; }

        [DisplayName("Invoice Date")]
        public string? Invoice_Number_Date { get; set; }

        [DisplayName("RCEP Country")]
        public string? RCEP_Country { get; set; }
        [DisplayName("Remarks")]
        public string? Remarks { get; set; }

        [DisplayName("FOB - Value")]
        public string? FOB_Val { get; set; }


        [DisplayName("Back-to-Back CO")]
        public string? BackToBackCO { get; set; }

        [DisplayName("Third Country")]
        public string? ThirdCountry { get; set; }

        [DisplayName("Exhibition")]
        public string? Exhibition { get; set; }

        [DisplayName("Third-Party Invoicing")]
        public string? ThirdPartyInvoicing { get; set; }

        [DisplayName("Non-Party Invoicing")]
        public string? NonPartyInvoicing { get; set; }
        [DisplayName("Application of Article 3(7) of Protocol 1 to the Viet Nam – EU FTA ")]
        public string? Article3_7 { get; set; }
    }
}

