<?php

error_reporting(0);

header('Access-Control-Allow-Origin: *');
header('Content-type: application/json');

if(isset($_GET['method']))
	switch($_GET['method']){

		case "login" :
			if($_POST['user'] == 'gion')
				echo json_encode(array(
					'success' => true,
					'result' => array('id' => '123')
				));
			else
				echo json_encode(array(
					'success' => false,
					'message' => 'invalid credentials'
				));

			break;

		case "getLeagues" :
			$leagues = array();

			for($i=0;$i<6;$i++)
				{
					$leagues[$i] = array(
						'id' => $i,
						'rank' => rand(0,10),
						'score' => 100 * rand(0, 100),
						'name' => 'league #' . $i
					);
				}

			echo json_encode(array(
				'success' => true,
				'result' => $leagues
			));
			break;

		case "ranks" :
			$leagues = array();

			for($i=0;$i<20;$i++)
				{
					$leagues[$i] = array(
						'id' => $i,
						'rank' => rand(0,10),
						'score' => 100 * rand(0, 100),
						'name' => 'league #' . $i
					);
				}

			echo json_encode(array(
				'success' => true,
				'result' => $leagues
			));
			break;

	}
else
	echo json_encode(array(
		'success' => false,
		'message' => 'no valid method provided'
	));