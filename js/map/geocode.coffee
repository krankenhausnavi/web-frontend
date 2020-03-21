##
# Get lat/lon for given address.
# Uses Bing location service.
#
# @param string query
#  The address
#
# @param function callback
#  Callback function that takes long, lat and zip code.
##
window.geocode_query = (query, callback)->
  data =
    'query': query
    'culture': 'de'
    'key': window.Config.BING_API_KEY

  jQuery.ajax
    'url': 'https://dev.virtualearth.net/REST/v1/Locations',
    'data': data,
    'dataType': 'jsonp',
    'jsonp': 'jsonp',
    success: (data)->
      result = data.resourceSets?[0]?.resources?[0]
      latlon = result?.geocodePoints?[0]?.coordinates
      zip = result?.address?.postalCode

      if latlon?[0]? && latlon?[1]
        callback latlon[1], latlon[0], zip

      return
  return

