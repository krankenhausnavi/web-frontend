window.enable_autocomplete_of_address = (address_field)->
  address_field.autocomplete({
    source: (request, response)->
      data = {
        'query': request.term
        'culture': 'de'
        'key': window.Config.BING_API_KEY
      }

      jQuery.ajax(
        'url': 'https://dev.virtualearth.net/REST/v1/Locations',
        'data': data,
        'dataType': 'jsonp',
        'jsonp': 'jsonp',
        success: (data) =>
          names = []
          for resourceSet in data.resourceSets
            for resource in resourceSet.resources
              names.push(resource.name)
          response(names)
      )
  })
  return
