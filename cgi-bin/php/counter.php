<?php

/*
 * Copyright (c) Sebastian Kucharczyk <kuchen@kekse.biz>
 */

/*
 * BE SURE TO `chmod 1777 ./counter/`.. (so that PHP can access there, with write permissions, too)!
 */
//
define('AUTO', 255);
define('DIRECTORY', 'counter');
//define('THRESHOLD', 600);
define('THRESHOLD', 7200);
define('LENGTH', 255);
define('CHARS', array_merge(range('a', 'z'), range('0', '9'), ['.','-',':']));
define('COOKIE', 'timestamp');
define('COOKIE_SAME_SITE', 'Strict');
define('COOKIE_PATH', '/');
define('COOKIE_HTTP_ONLY', true);
define('COOKIE_SECURE', !!$_SERVER['HTTPS']);
define('CONTENT_TYPE', 'text/plain;charset=UTF-8');

//
header('Content-Type: ' . CONTENT_TYPE);

//
if(AUTO === null)
{
	die('/');
}

//
function secureHost($_host)
{
	$_host = strtolower($_host);
	$length = min(strlen($_host), LENGTH);
	$result = '';
	$hadPort = false;

	if($_host[0] === '[' && $_host[strlen($_host) - 1] === ']')
	{
		$_host = $_host.substr(1, -1);
	}

	for($i = 0; $i < $length; $i++)
	{
		if(in_array($_host[$i], CHARS))
		{
			if($_host[$i] === '.')
			{
				if(strlen($result) === 0)
				{
					continue;
				}
				else if($result[strlen($result) - 1] === '.')
				{
					continue;
				}
			}
			else if($_host[$i] === ':')
			{
				if($hadPort)
				{
					continue;
				}

				$hadPort = true;
			}

			$result .= $_host[$i];
		}
	}

	if(strlen($result) === 0)
	{
		die('Filtered hostname got no length');
	}

	return $result;
}

//
function endsWith($_haystack, $_needle)
{
	if(strlen($_needle) > strlen($_haystack))
	{
		return false;
	}

	return (substr($_haystack, -strlen($_needle)) === $_needle);
}

$host = '';

if(strlen($_SERVER['HTTP_HOST']) > 0)
{
	$host = $_SERVER['HTTP_HOST'];
}
else if(strlen($_SERVER['SERVER_NAME']) > 0)
{
	$host = $_SERVER['SERVER_NAME'];
}
else if(strlen($_SERVER['SERVER_ADDR']) > 0)
{
	$host = $_SERVER['SERVER_ADDR'];
}
else
{
	die('No server host/name/addr applicable');
}

$host = secureHost($host);

if(strlen($_SERVER['SERVER_PORT']) > 0)
{
	if($_SERVER['HTTPS'])
	{
		if($_SERVER['SERVER_PORT'] === '443')
		{
			if(endsWith($host, ':443'))
			{
				$host = substr($host, -4);
			}
		}
		else if(! endsWith($host, (':' . $_SERVER['SERVER_PORT'])))
		{
			$host .= (':' . $_SERVER['SERVER_PORT']);
		}
	}
	else if($_SERVER['SERVER_PORT'] === '80')
	{
		if(endsWith($host, ':80'))
		{
			$host = substr($host, -3);
		}
	}
	else if(! endsWith($host, (':' . $_SERVER['SERVER_PORT'])))
	{
		$host .= (':' . $_SERVER['SERVER_PORT']);
	}
}

define('HOST', $host);
define('PATH', (DIRECTORY . '/' . $host));
unset($host);

//
if(! file_exists(DIRECTORY))
{
	die('Directory \'' . DIRECTORY . '\' doesn\'t exist - create with `chmod 1777`.');
}
else if(AUTO !== true && ! file_exists(PATH))
{
	if(AUTO === false)
	{
		die('/');
	}
	else if(gettype(AUTO) === 'integer')
	{
		$existing = (count(scandir(DIRECTORY)) - 2);

		if($existing >= AUTO)
		{
			die('/');
		}
	}
	else
	{
		die('Invalid \'AUTO\' constant');
	}
}

//
function timestamp($_difference = null)
{
	if(gettype($_difference) !== 'integer')
	{
		return time();
	}
	
	return (time() - $_difference);
}

function testCookie()
{
	if(! isset($_COOKIE[COOKIE]))
	{
		makeCookie();
	}
	else if(timestamp((int)$_COOKIE[COOKIE]) < THRESHOLD)
	{
		return false;
	}

	return true;
}

function makeCookie()
{
	return setcookie(COOKIE, timestamp(), array(
		'expires' => (time() + THRESHOLD),
		'domain' => HOST,
		'secure' => COOKIE_SECURE,
		'path' => COOKIE_PATH,
		'samesite' => COOKIE_SAME_SITE,
		'httponly' => COOKIE_HTTP_ONLY
	));
}

function readCounter($_path = PATH)
{
	if(! file_exists($_path))
	{
		touch($_path);
		return 0;
	}

	return (int)file_get_contents($_path);
}

function writeCounter($_value = 0, $_path = PATH)
{
	return file_put_contents($_path, (string)$_value);
}

//
$count = readCounter();

if(testCookie())
{
	writeCounter(++$count);
}

makeCookie();

//
$count = (string)$count;
header('Content-Length: ' . strlen($count));
echo $count;

//
exit();

?>

