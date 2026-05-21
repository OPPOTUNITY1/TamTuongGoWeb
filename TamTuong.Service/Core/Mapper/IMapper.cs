using System;
using System.Collections.Generic;
using System.Text;

namespace TamTuong.Service.Core.Mapper
{
    public interface IMapper
    {
        TDestination Map<TSource, TDestination>(TSource source);
        TDestination Map<TSource, TDestination>(TSource source, TDestination destination);
        IEnumerable<TDestination> MapList<TSource, TDestination>(IEnumerable<TSource> sourceList);

        List<TDestination> MapToList<TSource, TDestination>(List<TSource> sourceList);

    }
}
