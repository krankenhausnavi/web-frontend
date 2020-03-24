<?php

/* This is real spaghetti code, sorry. Just hacked down to get things flying. */

/*::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::*/
/*::                                                                         :*/
/*::  This routine calculates the distance between two points (given the     :*/
/*::  latitude/longitude of those points). It is being used to calculate     :*/
/*::  the distance between two locations using GeoDataSource(TM) Products    :*/
/*::                                                                         :*/
/*::  Definitions:                                                           :*/
/*::    South latitudes are negative, east longitudes are positive           :*/
/*::                                                                         :*/
/*::  Passed to function:                                                    :*/
/*::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :*/
/*::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :*/
/*::    unit = the unit you desire for results                               :*/
/*::           where: 'M' is statute miles (default)                         :*/
/*::                  'K' is kilometers                                      :*/
/*::                  'N' is nautical miles                                  :*/
/*::  Worldwide cities and other features databases with latitude longitude  :*/
/*::  are available at https://www.geodatasource.com                          :*/
/*::                                                                         :*/
/*::  For enquiries, please contact sales@geodatasource.com                  :*/
/*::                                                                         :*/
/*::  Official Web site: https://www.geodatasource.com                        :*/
/*::                                                                         :*/
/*::         GeoDataSource.com (C) All Rights Reserved 2018                  :*/
/*::                                                                         :*/
/*::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::*/
function distance($lat1, $lon1, $lat2, $lon2, $unit) {
  if (($lat1 == $lat2) && ($lon1 == $lon2)) {
    return 0;
  }
  else {
    $theta = $lon1 - $lon2;
    $dist = sin(deg2rad($lat1)) * sin(deg2rad($lat2)) +  cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * cos(deg2rad($theta));
    $dist = acos($dist);
    $dist = rad2deg($dist);
    $miles = $dist * 60 * 1.1515;
    $unit = strtoupper($unit);

    if ($unit == "K") {
      return ($miles * 1.609344);
    } else if ($unit == "N") {
      return ($miles * 0.8684);
    } else {
      return $miles;
    }
  }
}

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// I really, really should change the pw and move this.
// At least the db is only accessible from localhost.
$db_host = "localhost";
$db_name = "krankenbett";
$db_user = "krankenbett";
$db_password = "Igv214Wfdz40&0";


if (empty($_GET['lat']) || empty($_GET['lon']) || empty($_GET['area'])) {
    die('missing lat, lon or area in query params.');
}

$lat = $_GET['lat'];
$lon = $_GET['lon'];
$area = $_GET['area'];

$format = 'standard';

if (!empty($_GET['format']) && $_GET['format'] == 'geojson') {
    $format = 'geojson';
}

if (!is_numeric($lat) || !is_numeric($lon) || !is_numeric($area) || $lat < 0 || $lat > 180 || $lon < -90 || $lon > 90 || $area > 1000) {
    die('sanity check of parameters failed.');
}

// lets assume the earth is flat and that 1 degree messures 111.32 km
// https://en.wikipedia.org/wiki/Decimal_degrees

$area_in_degree = $area / 111.32;

$min_lat = $lat - $area_in_degree;
$max_lat = $lat + $area_in_degree;
$min_lon = $lon - $area_in_degree;
$max_lon = $lon + $area_in_degree;

// echo "min_lat: $min_lat";
// echo "max_lat: $max_lat";
// echo "min_lon: $min_lon";
// echo "max_lon: $max_lon";

$dsn = "mysql:host=${db_host};dbname=${db_name}";
$pdo = new PDO($dsn, $db_user, $db_password);

/*
 Example data
{
    "id": 1,
    "name": "Arztpraxis 1",
    "type": "DOCTOR",
    "street": "ANYTHING ELSE",
    "city": "ANY_CITY",
    "postal_code": "POSTAL_CODE",
    "phone_number": "123123131",
    "website": "http://example.com",
    "longitude": 32.99659895013735,
    "latitude": 3.0245133799402684,
    "comment": "Bitte nicht ohne Termin",
    "opening_hours": [
      {
        "day": "MONTAG",
        "start_time": "08:00",
        "end_time": "12:00"
      },
      {
        "day": "MONTAG",
        "start_time": "12:00",
        "end_time": "16:00"
      }
    ],
    "resources": [
      null,
      null
    ],
    "waiting_times": [
      {
        "type": "Hausbesuch",
        "waiting_time": "2 Tage",
        "last_update": "Sun Mar 22 2020"
      }
    ]
  }

{
    "id": "1",
    "name": "Krankenhaus",
    "type": "HOSPITAL",
    "street": "ANYTHING ELSE",
    "city": "ANY_CITY",
    "postal_code": "POSTAL_CODE",
    "phone_number": "123123131",
    "website": "http://example.com",
    "longitude": 124341.31244,
    "latitude": 124341.31244,
    "comment": "Bitte nicht ohne Termin",
    "opening_hours": [
        {
            "day": "MONTAG",
            "start_time": "08:00",
            "end_time": "12:00"
        },
        {
            "day": "MONTAG",
            "start_time": "12:00",
            "end_time": "16:00"
        }
    ],
    "resources": [
        {
            "type": "Intensivbetten",
            "max_available": 16,
            "in_use": 12,
            "last_update": "Sun Mar 22 2020"
        },
        {
            "type": "Betten",
            "max_available": 30,
            "in_use": 20,
            "last_update": "Sun Mar 22 2020"
        }
    ],
    "waiting_times": []
}
*/

$sql = <<<EOF
    SELECT
        i.id as i_id,
        i.name as i_name,
        i.type as i_type,
        i.street as i_street,
        i.city as i_city,
        i.postcode as i_postcode,
        i.phone as i_phone,
        i.website as i_website,
        i.lon as i_lon,
        i.lat as i_lat,
        i.comment as i_comment,
        o.id as o_id,
        o.day as o_day,
        o.start_time as o_start_time,
        o.end_time as o_end_time,
        r.id AS r_id,
        r.resource_type AS r_resource_type,
        r.max_capacity AS r_max_capacity,
        r.current_capacity AS r_current_capacity,
        r.timestamp AS r_timestamp,
        w.id AS w_id,
        w.service_type AS w_service_type,
        w.waiting_time AS w_waiting_time,
        w.timestamp AS w_timestamp
    FROM institutions i
    LEFT JOIN opening_hours o ON i.id = o.institution_id
    LEFT JOIN resources r ON i.id = r.institution_id
    LEFT JOIN waiting_times w ON i.id = w.institution_id
    WHERE lat BETWEEN ? AND ? AND lon BETWEEN ? AND ?
    ORDER BY i.lon;
EOF;


$stmt = $pdo->prepare($sql);
$stmt->execute(array($min_lat, $max_lat, $min_lon, $max_lon));

$results = array();

while ($row = $stmt->fetch()) {
    $id = $row['i_id'];

    // calculate distance
    $distance = distance($lat, $lon, $row['i_lat'], $row['i_lon'], 'K');

    // Check that point is really in area
    // Because we select in a square and not in a circle.
    if ($distance > $area) {
        continue;
    }

    // If type parameter is set then only process rows with correct rows.
    if (!empty($_GET['type'])) {
        if (strtoupper($row['i_type'])  != strtoupper($_GET['type'])) {
            continue;
        }
    }

    $poi = array(
        'id' => $row['i_id'],
        'distance' => $distance,
        'name' => $row['i_name'],
        'type' => strtoupper($row['i_type']),
        'street' => $row['i_street'],
        'city' => $row['i_city'],
        'postal_code' => $row['i_postcode'],
        'phone_number' => $row['i_phone'],
        'website' => $row['i_website'],
        'longitude' => $row['i_lon'],
        'latitude' => $row['i_lat'],
        'comment' => $row['i_comment'],
     );

    if ($row['o_id'] !== null) {
        $poi['opening_hours'] = array(
            $row['o_id'] => array(
                'day' => $row['o_day'],
                'start_time' => $row['o_start_time'],
                'end_time' => $row['o_end_time'],
            ),
        );
    } else {
        $poi['opening_hours'] = array();
    }

    // $max_available = random_int(10, 300);
    // $in_use = floor($max_available * random_int(1, 100)/100);
    $in_use = 10;
    $max_available = 100;

    if ($row['r_id'] !== null) {
        $poi['resources'] = array(
            $row['r_id'] => array(
                'type' => $row['r_resource_type'],
                'max_available' => $row['r_max_capacity'],
                'in_use' => $row['r_current_capacity'],
                'last_update' => $in_use,
            )
        );
    }  else {
        $poi['resources'] = array();
    }

    if ($row['w_id'] !== null) {
        $poi['waiting_times'] = array(
            $row['w_id'] => array(
                'type' => $row['w_service_type'],
                'waiting_time' => $row['w_waiting_time'],
                'last_update' => $row['w_timestamp'],
            )
        );
    } else {
        $poi['waiting_times'] = array();
    }

    if (empty($results[$id])) {
        $results[$id] = $poi;
    } else {
        $results[$id]['opening_hours'] += $poi['opening_hours'];
        $results[$id]['resources'] += $poi['resources'];
        $results[$id]['waiting_times'] += $poi['waiting_times'];
    }
}

function results_format_standard($results) {
    $formatted_results = array();
    foreach ($results as $poi) {
        $poi['opening_hours'] = array_values($poi['opening_hours']);
        $poi['resources'] = array_values($poi['resources']);
        $poi['waiting_times'] = array_values($poi['waiting_times']);
        $formatted_results[] = $poi;
    }
    return $formatted_results;
}

function results_format_geojson($results) {
    $features = array();

    foreach ($results as $poi) {
        $type = $poi['type'];
        $id = $poi['id'];

        $properties = array();

        if (!empty($poi['website'])) {
            $properties['Webseite'] = $poi['website'];
        }

        if (!empty($poi['phone_number'])) {
            $properties['Telefonnummer'] = $poi['phone_number'];
        }

        if (!empty($poi['street'])) {
            $properties['Straße'] = $poi['street'];
        }

        if (!empty($poi['name'])) {
            $properties['Name'] = $poi['name'];
        }

        if (!empty($poi['postal_code'])) {
            $properties['PLZ'] = $poi['postal_code'];
        }

        if (!empty($poi['city'])) {
            $properties['Stadt'] = $poi['city'];
        }

        if (!empty($poi['website'])) {
            $properties['Webseite'] = $poi['website'];
        }

        $properties["<button class=\"more-info btn btn-info btn-block btn-lg\" data-type=\"${type}\" data-id=\"${id}\">&nbsp;Mehr Informationen</a>"] = "";

        $feature = array(
            'type' => 'Feature',
            'geometry' => array(
                'type' => 'Point',
                'coordinates' => array(
                    $poi['longitude'],
                    $poi['latitude'],
                )
            ),
            'properties' => $properties
        );

        $features[] = $feature;
    }

    return array(
        'type' => 'FeatureCollection',
        'features' => $features
    );
}

header('Content-Type: application/json');

if ($format == 'geojson') {
    echo json_encode(results_format_geojson($results));
} else {
    echo json_encode(results_format_standard($results));
}
