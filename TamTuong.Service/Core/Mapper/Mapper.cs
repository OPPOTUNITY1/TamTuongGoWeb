using System;
using System.Collections.Generic;
using System.Text;

namespace TamTuong.Service.Core.Mapper
{
    #region v1
    public class Mapper : IMapper
    {

        public TDestination Map<TSource, TDestination>(TSource source)
        {
            var destination = Activator.CreateInstance<TDestination>();
            MapObject(source, destination);
            return destination;
        }


        public TDestination Map<TSource, TDestination>(TSource source, TDestination destination)
        {
            MapObject(source, destination);
            return destination;
        }


        public IEnumerable<TDestination> MapList<TSource, TDestination>(IEnumerable<TSource> sourceList)
        {
            List<TDestination> destinationList = new List<TDestination>();

            foreach (var source in sourceList)
            {
                TDestination destination = Map<TSource, TDestination>(source);
                destinationList.Add(destination);
            }

            return destinationList;
        }

        public List<TDestination> MapToList<TSource, TDestination>(List<TSource> sourceList)
        {
            List<TDestination> destinationList = new List<TDestination>();

            foreach (var source in sourceList)
            {
                TDestination destination = Map<TSource, TDestination>(source);
                destinationList.Add(destination);
            }

            return destinationList;
        }

        private void MapObject<TSource, TDestination>(TSource source, TDestination destination)
        {
            var sourceProperties = typeof(TSource).GetProperties();
            var destinationProperties = typeof(TDestination).GetProperties();

            foreach (var sourceProperty in sourceProperties)
            {
                var srcType = sourceProperty.PropertyType;
                var srcUnderlyingType = Nullable.GetUnderlyingType(srcType) ?? srcType;

                var destinationProperty = destinationProperties.FirstOrDefault(p =>
                {
                    if (p.Name != sourceProperty.Name) return false;
                    var destType = p.PropertyType;
                    var destUnderlyingType = Nullable.GetUnderlyingType(destType) ?? destType;
                    return srcUnderlyingType == destUnderlyingType;
                });

                if (destinationProperty != null && destinationProperty.CanWrite)
                {
                    var value = sourceProperty.GetValue(source);
                    // Skip if trying to set null into a non-nullable value type
                    if (value == null
                        && Nullable.GetUnderlyingType(destinationProperty.PropertyType) == null
                        && destinationProperty.PropertyType.IsValueType)
                    {
                        continue;
                    }
                    destinationProperty.SetValue(destination, value);
                }
            }
        }


    }
    #endregion
}
