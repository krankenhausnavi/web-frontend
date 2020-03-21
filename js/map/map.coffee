obj_to_arr = (obj)->
    ar = []
    for key, value of obj
        ar.push(value)
    ar

class window.Map
    ##
    # @param string map_div
    #  The id of a div to draw the map on.
    ##
    constructor: (@map_div) ->

        # List of WKT shapes the map possesses.
        @_wkt_shapes = {}
        
        # List of overlay layers the map possesses.
        @_overlay_layers = []

        # Dictionary mapping poi type id to layer.
        @_poi_layers = {}

        # Select feature for pois.
        @_poi_select_feature

        # OpenLayers map object.
        @_ol_map

        # Create OpenLayers map object.
        options =
            div: @map_div
            projection: new OpenLayers.Projection('EPSG:900913')
            displayProjection: new OpenLayers.Projection('EPSG:4326')
            autoUpdateSize: false
            zoomOffset: 5
            controls: [
                new OpenLayers.Control.MousePosition()
                new OpenLayers.Control.Attribution()
                new OpenLayers.Control.TouchNavigation(
                    dragPanOptions:
                        enableKinetic: true
                )
            ]

            layers: [
                new OpenLayers.Layer.OSM(
                    'OpenStreetMap'
                    [
                        "https:///a.tile.openstreetmap.org/${z}/${x}/${y}.png"
                        "https://b.tile.openstreetmap.org/${z}/${x}/${y}.png"
                        "https://c.tile.openstreetmap.org/${z}/${x}/${y}.png"
                    ],
                    {}
                )
                new OpenLayers.Layer.Bing(
                    key:  window.Config.BING_API_KEY
                    type: 'Road'
                    name: 'Bing Strasse'
                )
                new OpenLayers.Layer.Bing(
                    key:  window.Config.BING_API_KEY
                    type: 'Aerial'
                    name: 'Bing Luftbilder'
                )
                new OpenLayers.Layer.Bing(
                    key:  window.Config.BING_API_KEY
                    type: 'AerialWithLabels'
                    name: 'Bing Luftbilder + Strassen'
                )
            ]
        @_ol_map = new OpenLayers.Map(options)

        # Extend OpenLayers default styling.
        style =
            strokeWidth: 4
            strokeColor: '#03C'
            fillColor: '#95B0D0'
            fillOpacity: 0.0

        for key, value of style
            OpenLayers.Feature.Vector.style.default[key] = value


        # Create divs for showing information about a marker
        # and a dialog for map settings.
        jQuery("##{@map_div}").before("""
            <div class="mapDialog modal modal-centered" id="#{@map_div}_marker_info">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button
                                type="button"
                                class="close"
                                data-dismiss="modal"
                                aria-label="Close"
                            >
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <h4 class="modal-title">POI</h4>
                        </div>
                        <div class="modal-body">
                            <div class="markerTable"></div>
                        </div>
                        <div class="modal-footer">
                            <button
                                type="button"
                                class="btn btn-inverse"
                                data-dismiss="modal"
                            >
                                Schließen
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="MapButtons">
                <button
                    class="btn btn-info"
                    type="button"
                    data-toggle="popover"
                    data-animation="false"
                    data-placement="bottom"
                    data-content="<div id='#{@map_div}_map_settings_list'></div>"
                    data-html="true"
                    id="#{@map_div}_settings"
                >
                    <i class="fas fa-cogs"></i>
                    Einstellungen
                </button>
                <button
                    class="pois-settings btn btn-primary"
                    type="button"
                    data-toggle="popover"
                    data-animation="false"
                    data-placement="bottom"
                    data-html="true"
                    data-content="<div id='#{@map_div}_pois_settings_list'></div>"
                    id="#{@map_div}_pois_settings"
                >
                    <i class="fas fa-thumbtack"></i>
                    Punkte
                </button>

                <br>

                <div class="ZoomButtons">
                        <button
                            id="#{@map_div}_zoom_in"
                            class="ZoomInButton btn btn-inverse"
                        >
                            <i class="fas fa-plus"></i>
                        </button>
                        <button
                            id="#{@map_div}_zoom_out"
                            class="ZoomOutButton btn btn-inverse"
                        >
                            <i class="fas fa-minus"></i>
                        </button>
                </div>
                <div id ="#{@map_div}_map_move" class="MapMove">
                    <button class="north" title="nach Norden"></button>
                    <button class="east" title="nach Osten"></button>
                    <button class="south" title="nach Süden"></button>
                    <button class="west" title="nach Westen"></button>
                </div>
            </div>
        """)

        settings = jQuery("##{@map_div}_settings")
        pois_settings = jQuery("##{@map_div}_pois_settings")

        # Create popover for settings dialog.
        # Fill dialog with data when opening dialog.
        settings.popover()
        settings.on 'show.bs.popover', () =>
            if pois_settings.next('.popover').length > 0
                pois_settings.click()
            return
        .on 'shown.bs.popover', ()=>
            popover = settings.next('.popover')
            @_showMapSettings()
            @_moveObjRelToMap(
                popover,
                settings.position().left + 10,
                0
            )
            popover.css('top', settings.position().top + 40)
            return

        # Create popover for selecting types of POIs.
        # Fill dialog with data when opening dialog.
        # Only allow opening one dialog at a time.
        pois_settings.popover()
        pois_settings.on 'show.bs.popover', () =>
            if settings.next('.popover').length > 0
                settings.click()
            return
        pois_settings.on 'shown.bs.popover', ()=>
            popover = pois_settings.next('.popover');
            @_showPoisSettings()
            @_moveObjRelToMap(
                popover,
                pois_settings.position().left + 10,
                0
            )
            popover.css('top', pois_settings.position().top + 40)
            return

        # Zoom map on click.
        jQuery("##{@map_div}_zoom_in").click ()=>
            @_ol_map.zoomIn()
            return
        jQuery("##{@map_div}_zoom_out").click ()=>
            @_ol_map.zoomOut()
            return

        # Move map on click.
        four_way = jQuery("##{@map_div}_map_move button").click ()=>
            @_moveMap(`jQuery(this)`.attr('class'))

        # Listen to changes of selected POI types.
        jQuery(document).bind 'typesChanged', (e)=>
            for type, layer of @_poi_layers
                display = "#{type}" is '-1' or type in e.types
                layer.setVisibility(display)

                # Recreate poi types dialog if it is open.
                if pois_settings.next('.popover').length > 0
                    @_showPoisSettings()
            return


    ##
    # Adds a new layer of WKT shapes to the map.
    #
    #  @param string title
    #   The title of the new layer.
    #
    #  @param array shapes
    #   A list of WKT shapes.
    #
    #  @return OpenLayers.Layer.Vector
    #   The layer on which the shapes have been drawn.
    ##
    addShapes: (title, shapes)->
        # Store the new shapes in the map object.
        jQuery.extend(@_wkt_shapes, shapes)

        # Add a new layer for vector shapes to the map.
        vector = new OpenLayers.Layer.Vector(title)
        @_ol_map.addLayer(vector)

        for shape in shapes
            wkt = new OpenLayers.Format.WKT()
            feature = wkt.read(shape)
            feature.geometry.transform(
                @_ol_map.displayProjection
                @_ol_map.getProjectionObject()
            )
            vector.addFeatures(feature)

        @_overlay_layers.push(vector)

        vector

    ##
    # Wrapper around OpenLayers.Map.zoomToExtend.
    # @see http://dev.openlayers.org/docs/files/OpenLayers/Map-js.html#OpenLayers.Map.zoomToExtent
    ##
    zoomToExtent: (layer)->
        @_ol_map.zoomToExtent(layer.getDataExtent())

    ##
    # Wrapper around OpenLayers.Map.setCenter.
    # @see http://dev.openlayers.org/docs/files/OpenLayers/Map-js.html#OpenLayers.Map.setCenter
    ##
    setCenter: (lon, lat, zoom, dragging, forceZoomChange	)->
        lonlat = new OpenLayers.LonLat(lon, lat)
        .transform(@_ol_map.displayProjection, @_ol_map.projection)

        @_ol_map.setCenter(lonlat, zoom, dragging, forceZoomChange)

    ##
    # Wrapper around OpenLayers.Map.updateSize.
    # @see http://dev.openlayers.org/docs/files/OpenLayers/Map-js.html#OpenLayers.Map.updateSize
    ##
    updateSize: ()->
        @_ol_map.updateSize()

    ##
    # Wrapper around OpenLayers.Map.removeLayer.
    # @see http://dev.openlayers.org/docs/files/OpenLayers/Map-js.html#OpenLayers.Map.removeLayer
    ##
    removeLayer: (layer)->
        for i,l of @_poi_layers
          if l is layer
            delete @_poi_layers[i]

        for l,i in @_overlay_layers
          if l is layer
            @_overlay_layers.splice(i, 1)

        @_poi_select_feature.setLayer(obj_to_arr(@_poi_layers))
        @_ol_map.removeLayer(layer)

    ##
    # Make elements in given layer draggable call given callback with lat/lon when feature is moved.
    # This function is only useful with layers that have a single element.
    #
    # @param OpenLayers.Layer.Vector
    #  The layer which to make draggable.
    #
    # @param function callback
    #  Callback that takes latitude and longitude of result.
    ##
    dragVector: (layer, callback) ->
        # Create Drag Feature.
        options =
            'onDrag': (feature, pixel) =>
                lonlat = new OpenLayers.LonLat(feature.geometry.x, feature.geometry.y).
                transform @_ol_map.projection, @_ol_map.displayProjection

                callback lonlat.lon, lonlat.lat
                return

        drag = new OpenLayers.Control.DragFeature layer, options

        @_ol_map.addControl(drag)
        drag.activate()

    ##
    # Moves features in given vector layer to given position.
    # This function is only useful with layers that have a single element.
    #
    # @param OpenLayers.Layer.Vector
    #  The layer into which to look for layers.
    #
    # @param float lat
    #  The latitude of the new position.
    #
    # @param float lon
    #  The longitude of the new position.
    ##
    moveFeatureInVector: (layer, lon, lat)->
        # Walk through features in layer.
        for feature in layer.features
            lonlat = new OpenLayers.LonLat(lon, lat).
            transform @_ol_map.displayProjection, @_ol_map.projection

            feature.move(lonlat)

    ##
    # Adds a new layer with one marker to the map.
    #
    # @param string title
    #  A title for the layer.
    #
    # @param int lon
    #  The longitude of the position of the marker.
    #
    # @param int lat
    #  The latitude of the position of the marker.
    #
    # @param string icon_url
    #  Url to an icon for the marker.
    #
    # @param int icon_width
    #  Width of the icon.
    #
    # @param int icon_height
    #  Height of the icon.
    #
    # @return OpenLayers.Layer.Vector
    #  The layer with the marker.
    ##
    addMarker: (
        title
        lon
        lat
        icon_url
        icon_width = 32
        icon_height = 37
    )->
        # Create new layer for marker.
        layer = new OpenLayers.Layer.Vector(title)
        @_ol_map.addLayer(layer)

        # Create marker as feature.
        marker = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(lon, lat).transform(@_ol_map.displayProjection, @_ol_map.projection),
            {},
                externalGraphic: icon_url
                graphicHeight: icon_height
                graphicWidth: icon_width
        )

        # Add marker to layer
        layer.addFeatures(marker)

        # Store layer in layer list.
        @_overlay_layers.push(layer)

        # Return layer.
        layer

    ##
    # Adds a new layer of POIs with one marker to the map.
    #
    # @param string title
    #  A title for the layer.
    #
    # @param string pois_url
    #  URL from where to fetch the Data.
    #
    # @param int poi_type_id
    #  The id of the type of pois.
    #
    # @param string icon_url
    #  Url to an icon for the poi type.
    #
    # @param string cluster_color
    #  The color of the clusters as hex value.
    #
    # @param bool display
    #  The default visibility of the pois.
    #  If set to false the pois will be lazy loaded
    #  when needed.
    #
    # @param OpenLayers.Format format
    #  The format in which the pois are supplied.
    #
    # @param cluster_pois
    #  Whether to cluster pois or not.
    #
    # @return OpenLayers.Layer.Vector
    #  The layer with the POIs.
    ##
    addPois: (
        title
        pois_url
        poi_type_id
        icon_url
        cluster_color
        display = true
        format = new OpenLayers.Format.GeoJSON() 
        cluster_pois = true
    ) ->
        # Filter to distinguish between pois and clusters.
        is_cluster =  new OpenLayers.Filter.Comparison(
            type: OpenLayers.Filter.Comparison.GREATER_THAN
            property: "count"
            value: 1
        )

        # Styling for POIs.
        icon_rule = new OpenLayers.Rule(
            filter: new OpenLayers.Filter.Logical(
                type: OpenLayers.Filter.Logical.NOT
                filters: [is_cluster]
            )
            symbolizer:
                externalGraphic: icon_url
                graphicOpacity: 1.0
                graphicWidth: 32
                graphicHeight: 37
                graphicYOffset: -2
        )

        # Styling for clusters.
        cluster_rule = new OpenLayers.Rule(
            filter: is_cluster
            symbolizer:
                fillColor: cluster_color
                fillOpacity: 0.9
                strokeColor: cluster_color
                strokeOpacity: 0.5
                strokeWidth: 12
                pointRadius: 10
                label: "${count}"
                labelOutlineWidth: 1
                fontColor: "#fff"
                fontOpacity: 0.8
                fontSize: "12px"
        )

        options =
            projection: "EPSG:4326"
            protocol: new OpenLayers.Protocol.HTTP(
                url: pois_url
                "format": format
            )
            styleMap: new OpenLayers.StyleMap(new OpenLayers.Style(
                null
                rules: [cluster_rule, icon_rule]
            ))

        options.strategies = [new OpenLayers.Strategy.Fixed()]

        if cluster_pois
            options.strategies.push new OpenLayers.Strategy.Cluster(
                distance: 70
                threshold: 2
                animationMethod: OpenLayers.Easing.Expo.easeOut
                animationDuration: 5
            )

        layer = new OpenLayers.Layer.Vector(title, options)
        layer.setVisibility(display)

        # Create select feature for all pois if this hasn't been done yet.
        if not @_poi_select_feature?
            options =
                autoActivate: true
                onSelect: (feature) =>
                    # Unselect feature to allow reclicking on POIs.
                    @_poi_select_feature.unselect(feature)

                    @_markerClick(
                        feature
                        jQuery("##{@map_div}_marker_info")
                        `this.handlers.feature.evt.clientX`
                        `this.handlers.feature.evt.clientY`
                    )
            @_poi_select_feature = new OpenLayers.Control.SelectFeature([], options)
            @_ol_map.addControl(@_poi_select_feature)

        # Adds the new layer to the map and stores it in @_poi_layers
        # Also updates layer list on select feature.
        @_ol_map.addLayer(layer)
        @_poi_layers[poi_type_id] = layer
        @_poi_select_feature.setLayer(obj_to_arr(@_poi_layers))

        layer

    ##
    # Activate (lasy load) or deactivate given poi type id.
    #
    # @param int poi_type_id
    #  The id of the type of pois.
    #
    # @param bool display
    #  True to show (default), False to hide the layer.
    ##
    poisVisibility: (poi_type_id, display = true)->
        @_poi_layers[poi_type_id].setVisibility(display)

    ##
    # Event handler for the click event on markers.
    #
    # @param OpenLayers.Feature feature
    #  The feature on which the user has clicked.
    #
    # @param object modal
    #  Modal onto which display information.
    #
    # @param int posX
    #  X-coordinate of the marker.
    #  Relative to the top left corner of the viewport.
    #
    # @param int posY
    #  Y-coordinate of the marker.
    #  Relative to the top right corner of the viewport.
    ##
    _markerClick: (feature, modal, posX, posY) ->
        # Find marker table in given dialog.
        table_div = modal.find('.markerTable')

        # Empty table
        table_div.empty()

        # Cluster.
        if feature.attributes.count? and feature.attributes.count > 1
            modal.find('.modal-title').text('Sammlung')

            # List all pois in cluster.
            for poi in feature.cluster
                do (poi) =>
                    # Create an unique id for the wall with the POI information.
                    id = "cluster-#{Math.floor(Math.random() * 10000)}-#{new Date().getTime() % 1000}"

                    btn = jQuery('<button>'
                        'html': "#{poi.attributes.Name}"
                        'class': 'btn btn-info btn-block'
                        'type': 'button'
                        'data-target': "##{id}",
                        'data-toggle': 'collapse'
                        'style': 'margin-bottom: 10px; margin-top: 10px;'
                    )

                    collapse = jQuery('<div>'
                        'class': 'collapse no-transition'
                        'id': id
                    )

                    collapse.on 'shown.bs.collapse', ()->
                        modal.trigger('dialog-resize')
                        return

                    collapse.on 'hidden.bs.collapse', ()->
                        modal.trigger('dialog-resize')
                        return

                    @_createFeatureTable(collapse, poi)
                    table_div.append(btn)
                    table_div.append(collapse)

                    return

        # Poi.
        else
            modal.find('.modal-title').html(feature.attributes.Name)
            @_createFeatureTable(table_div, feature)


        # Show modal with information.
        modal.modal('show')

        jQuery.event.trigger
            type: 'markerClicked'
            "feature": feature
            "modal": modal

    ##
    # Create a table displaying information about a feature.
    #
    # @param object table_div
    #  The object to append the table to.
    #
    # @param OpenLayers.Feature feature
    #  The feature containg the info to display.
    ##
    _createFeatureTable: (table_div, feature)->
        # Output all attributes of given feature
        # as table.
        html = '<table>'
        for key, value of feature.attributes
            # Output attributes with key and value into two cells
            # and attributes with one key into a single row.
            if value != ""
                html += \
                "<tr>
                    <th>#{key}</th>
                    <td>#{value}</td>
                </tr>"
            else
                html += "<tr><td colspan=\"2\">#{key}</td></tr>"

        html += '</table>'
        table_div.append(html)

        return

    # Add given layer to given list.
    _addLayerToList: (layer, list, change_callback = null)->
        # Create checkbox for layer.
        input = jQuery('<input>',
            'type' : if layer.isBaseLayer then 'radio' else 'checkbox'
            'name' : if layer.isBaseLayer then 'baseLayer' else 'secondaryLayer'
            'value' : layer.name
            'id' : "check_#{layer.name}"
            'checked' : 'checked' if layer.getVisibility()
            'data-toggle' : if layer.isBaseLayer then 'radio' else 'checkbox'

        ).change (e)=>
            e.preventDefault()
            if layer.isBaseLayer
                layer.map.setBaseLayer(layer)
            else
                layer.setVisibility(not layer.getVisibility())

            if change_callback?
                change_callback()

            return

        # Create label that wraps around checkbox.
        label = jQuery('<label>',
            'for': "check_#{layer.name}"
            'class': if layer.isBaseLayer then 'radio' else 'checkbox'
        )

        label.append(input)
        label.append(layer.name)
        list.append(label)

        # input.radiocheck()

    ##
    # Shows the map settings panel.
    ##
    _showMapSettings: ()->
        list = jQuery("##{@map_div}_map_settings_list")
        list.empty()
        
        # Add label for base layers.
        jQuery('<strong>', {text: 'Karten'}).appendTo(list)
        jQuery('<br>').appendTo(list)

        # Add base layers.
        @_addLayerToList(layer, list) for layer in \
          @_ol_map.getLayersBy('isBaseLayer', true)

        # Add label for information layers.
        jQuery('<strong>', {text: 'Informationen'}).appendTo(list)
        jQuery('<br>').appendTo(list)

        # Add information layers to list.
        @_addLayerToList(layer, list) for layer in @_overlay_layers

        return

    ##
    # Shows a panel to select types of POIs.
    ##
    _showPoisSettings: ()->
        list = jQuery("##{@map_div}_pois_settings_list")
        list.empty()

        # Add label for poi layers.
        jQuery('<strong>', {text: 'Punkte in der Nähe'}).appendTo(list)

        # Trigger the types changed event when a user selects a poi type.
        change_calllback = ()=>
            types = []
            for type, layer of @_poi_layers
                if layer.visibility && type > 0
                    types.push(type)

            jQuery.event.trigger
                type: 'typesChanged'
                'types': types


        # Add POI layers to list.
        # @_addLayerToList(layer) for layer in @_poi_layers
        for type, layer of @_poi_layers
            if type > 0
                @_addLayerToList(layer, list, change_calllback)

        return

    ##
    # Move given jQuery html element to given position relative to the viewport
    # without overlapping the border of the map.
    ##
    _moveObjRelToViewport: (
        obj,
        posX,
        posY,
        width,
        height
    )->
        # Position dialog next to given destination but do not overlap the map.
        idealX = posX + 10 - jQuery("##{@map_div}").offset().left + jQuery(window).scrollLeft()
        idealY = posY + 10 - jQuery("##{@map_div}").offset().top + jQuery(window).scrollTop()

        @_moveObjRelToMap(obj, idealX, idealY, width, height)

        return

    ##
    # Move given jQuery html element to given position relative to the map
    # without overlapping the border of the map.
    ##
    _moveObjRelToMap: (
        obj,
        posX,
        posY,
        width = obj.outerWidth(),
        height = obj.outerHeight()
    )->
        max_left = jQuery("##{@map_div}").width() - width - 10
        max_top = jQuery("##{@map_div}").height() - height - 10
        obj.css('left', Math.min(posX, max_left))
        obj.css('top', Math.min(posY, max_top))

        return

    ##
    # Move map into one direction.
    #
    # @param string direction
    #  north, west, south or east – the direction into which to move the map.
    #
    # @param int pixels
    #  The number of pixels to move into the selected direction.
    ##
    _moveMap: (direction, pixels = 200)->
        lon = @_ol_map.center.lon
        lat = @_ol_map.center.lat

        mapunits = 100 * @_ol_map.getResolution()

        switch direction
            when "north" then lat += mapunits
            when "east"  then lon += mapunits
            when "south" then lat -= mapunits
            when "west"  then lon -= mapunits

        @_ol_map.setCenter new OpenLayers.LonLat(lon, lat)
