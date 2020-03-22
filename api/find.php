<?php

/* This is real spaghetti code, sorry. Just hacked down to get things flying. */

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
    LEFT JOIN waiting_times w ON w.id = w.institution_id
    WHERE lat >= ? AND lat <= ? AND lon >= ? AND lon <= ?;
EOF;


$stmt = $pdo->prepare($sql);
$stmt->execute(array($min_lat, $max_lat, $min_lon, $max_lon));

$results = array();

while ($row = $stmt->fetch()) {
    $id = $row['i_id'];
    $poi = array(
        'id' => $row['i_id'],
        'name' => $row['i_name'],
        'type' => strtoupper($row['i_type']),
        'street' => $row['i_street'],
        'city' => $row['i_city'],
        'postal_code' => $row['i_postcode'],
        'phone_number' => $row['i_phone'],
        'website' => $row['i_website'],
        'logitude' => $row['i_lon'],
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

    if ($row['r_id'] !== null) {
        $poi['resources'] = array(
            $row['r_id'] => array(
                'type' => $row['r_resource_type'],
                'max_available' => $row['r_max_capacity'],
                'in_use' => $row['r_current_capacity'],
                'last_update' => $row['r_timestamp'],
            )
        );
    }  else {
        $poi['resources'] = array();
    }

    if ($row['w_id'] !== null) {
        $poi['waiting_times'] = array(
            $row['r_id'] => array(
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
    $formated_results = array();
    foreach ($results as $poi) {
        $poi['opening_hours'] = array_values($poi['opening_hours']);
        $poi['resources'] = array_values($poi['resources']);
        $poi['waiting_times'] = array_values($poi['waiting_times']);
        $formated_results[] = $poi;
    }
    return $formated_results;
}

header('Content-Type: application/json');
echo json_encode(results_format_standard($results));