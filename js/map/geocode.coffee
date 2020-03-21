##
# Get lat/lon for given address.
# Uses Bing location service.
#
# @param string street
#  The street and house number of the address.
#
# @param int zip
#  The zip code of the address.
#
# @param string city
#  The city of the address.
#
# @param function callback
#  Callback function that takes long, lat and zip code.
##
window.geocode = (street, zip, city, callback)->
  data =
    'countryRegion': 'de'
    'postalCode': zip
    'locality': city
    'addressLine': street
    'culture': 'de'
    'key': window.Config.BING_API_KEY

  jQuery.ajax
    'url': 'https://dev.virtualearth.net/REST/v1/Locations'
    'data': data
    'dataType': 'jsonp'
    'jsonp': 'jsonp'
    success: (data)->
      result = data.resourceSets?[0]?.resources?[0]
      latlon = result?.geocodePoints?[0]?.coordinates
      zip = result?.address?.postalCode

      if latlon?[0]? && latlon?[1]
        callback latlon[1], latlon[0], zip

      return
  return

