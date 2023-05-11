(function()
{

	//
	const DEFAULT_THROW = true;
	const DEFAULT_PATH = 'js';
	const DEFAULT_CHARSET = 'utf-8';
	const DEFAULT_DEFER = true;
	const DEFAULT_TIMEOUT = 10000;
	const DEFAULT_AJAX_CALLBACKS = null;
	const DEFAULT_AJAX_CALLBACKS_TRUE = (1 | 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256);
	const DEFAULT_AJAX_CALLBACKS_FALSE = (1 | 2 | 4);
	const DEFAULT_AJAX_CALLBACKS_NULL = (1 | 2);
	const DEFAULT_STACK_TRACE_LIMIT = 32;

	//
	Error.stackTraceLimit = DEFAULT_STACK_TRACE_LIMIT;

	//
	sleep = (_delay) => {
		const end = (Date.now() + _delay);
		while(Date.now() < end) {};
		return _delay;
	};

	// provisorisch, vor numeric.js.
	isNumeric = (_value) => {
		if(isNumber(_value))
		{
			return true;
		}
		else if(typeof _value === 'bigint')
		{
			return true;
		}

		return false;
	};

	isNumber = (_value) => {
		if(typeof _value === 'number')
		{
			return (_value.valueOf() === _value.valueOf());
		}
		
		return false;
	};

	isInt = (_value) => {
		if(isNumber(_value))
		{
			return ((_value % 1) === 0);
		}

		return false;
	};

	isFloat = (_value) => {
		if(isNumber(_value))
		{
			return ((_value % 1) !== 0);
		}

		return false;
	};

	//
	__START = Date.now();
	window.ready = false;

	window.addEventListener('ready', () => {
		window.ready = true;
		__TIME = ((__STOP = Date.now()) - __START);
	}, { once: true });

	//
	document.setFullScreen = (_value = true, _throw = DEFAULT_THROW) => {
		var result, element;

		if(_value = !!_value)
		{
			element = document.documentElement;

			result = (element.requestFullscreen ||
				element.webkitRequestFullscreen ||
				element.mozRequestFullScreen ||
				element.msRequestFullscreen);
		}
		else
		{
			element = document;

			result = (element.exitFullscreen ||
				element.webkitExitFullscreen ||
				element.mozCancelFullScreen ||
				element.msExitFullscreen);
		}
		
		if(typeof result !== 'function')
		{
			if(_throw)
			{
				throw new Error('Feature not available');
			}

			return null;
		}
		
		return result.call(element);
	};

	//
	window.addEventListener('DOMContentLoaded', (_event) => {
		//
		(HTML = document.documentElement).id = 'HTML';

		//
		if(! (HEAD = document.head))
		{
			HTML.appendChild(HEAD = document.createElement('head'));
		}

		HEAD.id = 'HEAD';

		if(! (BODY = document.body))
		{
			HTML.appendChild(BODY = document.createElement('body'));
		}
		
		BODY.id = 'BODY';

		//
		if(! (MAIN = document.getElementById('MAIN')))
		{
			BODY.appendChild(MAIN = document.createElement('main'));
		}

		MAIN.id = 'MAIN';

		//
		if(! (COPYRIGHT = document.getElementById('COPYRIGHT')))
		{
			BODY.appendChild(COPYRIGHT = document.createElement('div'));
		}

		COPYRIGHT.id = 'COPYRIGHT';

		//
		if(! (UPDATED = document.getElementById('UPDATED')))
		{
			BODY.appendChild(UPDATED = document.createElement('div'));
		}

		UPDATED.id = 'UPDATED';

		//
		if(! (INFO = document.getElementById('INFO')))
		{
			BODY.appendChild(INFO = document.createElement('div'));
		}

		INFO.id = 'INFO';

		//
		if(! (VERSION = document.getElementById('VERSION')))
		{
			BODY.appendChild(VERSION = document.createElement('div'));
		}

		VERSION.id = 'VERSION';

		//
		if(! (COUNTER = document.getElementById('COUNTER')))
		{
			BODY.appendChild(COUNTER = document.createElement('div'));
		}

		COUNTER.id = 'COUNTER';
	}, { once: true });

	//
	const ajaxCallbackIndices = [ 'load', 'progress', 'failure' ];

	//
	ajax = (... _args) => {
		const options = Object.assign(... _args);

		for(var i = 0; i < _args.length; ++i)
		{
			if(typeof _args[i] === 'string' && _args[i].length > 0)
			{
				options.url = _args.splice(i--, 1)[0];
			}
			else if(typeof _args[i] === 'function')
			{
				options.callback = _args.splice(i--, 1)[0];
			}
			else if(typeof _args[i] === 'boolean')
			{
				//options.async = _args.splice(i--, 1)[0];
				options.callbacks = _args.splice(i--, 1);
			}
			else if(_args[i] === null)
			{
				options.callbacks = null;
			}
			else if(isInt(_args[i]) && _args[i] >= 0)
			{
				if(typeof options.callbacks === 'boolean')
				{
					options.async = options.callbacks;
				}

				options.callbacks = _args.splice(i--, 1)[0];
			}
		}

		if(! (isInt(options.callbacks) && options.callbacks >= 0))
		{
			if(typeof options.callbacks === 'boolean')
			{
				if(options.callbacks)
				{
					options.callbacks = DEFAULT_AJAX_CALLBACKS_TRUE;
				}
				else
				{
					options.callbacks = DEFAULT_AJAX_CALLBACKS_FALSE;
				}
			}
			else if(options.callbacks === null)
			{
				options.callbacks = DEFAULT_AJAX_CALLBACKS_NULL;
			}
			else if(typeof DEFAULT_AJAX_CALLBACKS === 'boolean')
			{
				if(DEFAULT_AJAX_CALLBACKS)
				{
					options.callbacks = DEFAULT_AJAX_CALLBACKS_TRUE;
				}
				else
				{
					options.callbacks = DEFAULT_AJAX_CALLBACKS_FALSE;
				}
			}
			else if(DEFAULT_AJAX_CALLBACKS === null)
			{
				options.callbacks = DEFAULT_AJAX_CALLBACKS_NULL;
			}
			else if(typeof DEFAULT_AJAX_CALLBACKS === 'number')
			{
				options.callbacks = DEFAULT_AJAX_CALLBACKS;
			}
			else
			{
				options.callbacks = DEFAULT_AJAX_CALLBACKS_NULL;
			}
		}

		if(typeof options.url !== 'string' || options.url.length === 0)
		{
			if(typeof options.path === 'string' && options.path.length > 0)
			{
				options.url = options.path;
			}
			else
			{
				throw new Error('Missing URL');
			}
		}

		delete options.path;

		if(typeof options.async !== 'boolean')
		{
			options.async = (typeof options.callback === 'function');
		}

		if(typeof options.callback !== 'function' || !options.async)
		{
			options.callback = null;
		}

		if(typeof options.data !== 'string')
		{
			options.data = null;
		}

		if(typeof options.method === 'string' && options.method.length > 0)
		{
			options.method = options.method.toUpperCase();
		}
		else
		{
			options.method = 'GET';
		}

		if(! options.async)
		{
			options.timeout = null;
		}
		else if(typeof options.timeout !== 'number' || options.timeout < 1)
		{
			options.timeout = DEFAULT_TIMEOUT;
		}

		if(typeof options.header !== 'object' || options.header === null)
		{
			options.header = {};
		}
		else for(const idx in options.headers)
		{
			if(typeof options.headers[idx] === 'number' || typeof options.headers[idx] === 'bigint')
			{
				options.headers[idx] = options.headers[idx].toString();
			}
			else if(typeof options.headers[idx] !== 'string')
			{
				delete options.headers[idx];
			}
		}

		if(typeof options.withCredentials !== 'boolean')
		{
			options.withCredentials = false;
		}

		if(typeof options.mime !== 'string' || options.mime.length === 0)
		{
			options.mime = null;
		}
		
		if(typeof options.responseType !== 'string')
		{
			options.responseType = '';
		}

		if(! (typeof options.username === 'string' && options.username.length > 0))
		{
			if(typeof options.user === 'string' && options.user.length > 0)
			{
				options.username = options.user;
			}
			
			delete options.user;
		}
		
		if(! (typeof options.password === 'string' && options.password.length > 0))
		{
			if(typeof options.pass === 'string' && options.pass.length > 0)
			{
				options.password = options.pass;
			}
			
			delete options.pass;
		}
		
		if(typeof options.token === 'string' && options.token.length > 0)
		{
			delete options.username;
			delete options.password;
		}
		else if(typeof options.username === 'string' && typeof options.password === 'string' && options.username.length > 0 && options.password.length > 0)
		{
			options.token = ajax.getAuthorization(options.username, options.password);
		}
		else
		{
			delete options.username;
			delete options.password;
			delete options.token;
		}
		
		if(typeof options.token === 'string' && options.token.length > 0)
		{
			options.headers.Authorization = ('Basic ' + options.token);
		}
		
		//
		//TODO/lengths.. range, etc..
		//
		
		if(options.async)
		{
			if(typeof options.callback !== 'function')
			{
				throw new Error('At least a regular callback function is necessary for .async');
			}
			
			if(typeof options.failureCallback === 'function' && typeof options.onfailure !== 'function')
			{
				options.onfailure = options.failureCallback;
			}
			
			if(typeof options.abortCallback === 'function' && typeof options.onabort !== 'function')
			{
				options.onabort = options.abortCallback;
			}
			
			if(typeof options.errorCallback === 'function' && typeof options.onerror !== 'function')
			{
				options.onerror = options.errorCallback;
			}
			
			if(typeof options.loadCallback === 'function' && typeof options.onload !== 'function')
			{
				options.onload = options.loadCallback;
			}
			
			if(typeof options.loadendCallback === 'function' && typeof options.onloadend !== 'function')
			{
				options.onloadend = options.loadendCallback;
			}
			
			if(typeof options.loadstartCallback === 'function' && typeof options.onloadstart !== 'function')
			{
				options.onloadstart = options.loadstartCallback;
			}
			
			if(typeof options.progressCallback === 'function' && typeof options.onprogress !== 'function')
			{
				options.onprogress = options.progressCallback;
			}
			
			if(typeof options.readystatechangeCallback === 'function' && typeof options.onreadystatechange !== 'function')
			{
				options.onreadystatechange = options.readystatechangeCallback;
			}
			
			if(typeof options.timeoutCallback === 'function' && typeof options.ontimeout !== 'function')
			{
				options.ontimeout = options.timeoutCallback;
			}
			
			if(typeof options.onfailure !== 'function')
			{
				delete options.onfailure;
			}
			
			if(typeof options.onabort !== 'function')
			{
				delete options.onabort;
			}
			
			if(typeof options.onerror !== 'function')
			{
				delete options.onerror;
			}
			
			if(typeof options.onload !== 'function')
			{
				delete options.onload;
			}
			
			if(typeof options.onloadend !== 'function')
			{
				delete options.onloadend;
			}
			
			if(typeof options.onloadstart !== 'function')
			{
				delete options.onloadstart;
			}
			
			if(typeof options.onprogress !== 'function')
			{
				delete options.onprogress;
			}
			
			if(typeof options.onreadystatechange !== 'function')
			{
				delete options.onreadystatechange;
			}
			
			if(typeof options.ontimeout !== 'function')
			{
				delete options.ontimeout;
			}
			
			delete options.failureCallback;
			delete options.abortCallback;
			delete options.errorCallback;
			delete options.loadCallback;
			delete options.loadendCallback;
			delete options.loadstartCallback;
			delete options.progressCallback;
			delete options.readystatechangeCallback;
			delete options.timeoutCallback;
		}
		else
		{
			delete options.callback;
			
			delete options.failureCallback;
			delete options.onfailure;
			
			delete options.abortCallback;
			delete options.onabort;
			
			delete options.errorCallback;
			delete options.onerror;
			
			delete options.loadCallback;
			delete options.onload;
			
			delete options.loadendCallback;
			delete options.onloadend;
			
			delete options.loadstartCallback;
			delete options.onloadstart;
			
			delete options.progressCallback;
			delete options.onprogress;
			
			delete options.readystatechangeCallback;
			delete options.onreadystatechange;
			
			delete options.timeoutCallback;
			delete options.ontimeout;
		}
		
		//
		const result = new XMLHttpRequest();
		result.start = Date.now();
		result.open(options.method, options.url, options.async, options.username, options.password);
		
		if(options.async)
		{
			if(typeof options.timeout === 'number')
			{
				result.timeout = options.timeout;
			}
			
			if(typeof options.responseType === 'string')
			{
				result.responseType = options.responseType;
			}
		}
		
		//
		result.withCredentials = options.withCredentials;
		
		//
		if(typeof options.mime === 'string')
		{
			result.overrideMimeType(options.mime);
		}
		
		//
		for(const idx in options.headers)
		{
			result.setRequestHeader(idx, options.headers[idx]);
		}
		
		//
		handleRequest(result, options).send(options.data);
		
		//
		if(! options.async)
		{
			//
			result.stop = Date.now();
			result.time = (result.stop - result.start);
			
			//
			responseStatusClass(result);
			
			//
			/*if(result.statusClass === 2 && typeof result.responseText === 'string')
			{
				//ajax... stats.
			}*/
		}
		
		//
		return result;
	};

	Object.defineProperty(ajax, 'callbacks', { get: function()
	{
		const result = Object.create(null);

		result.load = 1;
		result.failure = 2;
		result.progress = 4;
		result.timeout = 8;
		result.error = 16;
		result.abort = 32;
		result.readystatechange = 64;
		result.loadend = 128;
		result.loadstart = 256;

		return result;
	}});
	
	ajax.getAuthorization = (_username, _password) => {
		return btoa(_username + ':' + _password);
	};

	ajax.rangeSupport = (_url, _type = 'bytes') => {
throw new Error('TODO');
		if(typeof _url !== 'string' || _url.length === 0)
		{
			throw new Error('Invalid _url argument');
		}
		else if(typeof _type !== 'string' || _type.length === 0)
		{
			_type = 'bytes';
		}
		else
		{
			_type = _type.toLowerCase();
		}

		const request = ajax({ url: _url, method: 'HEAD', async: false });//, null, { method: 'HEAD', range: '0-0' }, null);

		if(! request)
		{
			return null;
		}
		else if(request.statusClass !== 2)
		{
			return null;
		}

		const rangeStatus = (request.statusClass === 2);
		var acceptRanges = request.getResponseHeader('Accept-Ranges');
		var contentRange = request.getResponseHeader('Content-Range');

		if(acceptRanges !== null)
		{
			acceptRanges = (acceptRanges.toLowerCase() === _type);
		}
		else
		{
			acceptRanges = false;
		}

		if(contentRange !== null)
		{
			contentRange = (contentRange.toLowerCase().startsWith(_type + ' '));
		}
		else
		{
			contentRange = false;
		}

		return (rangeStatus || acceptRanges || contentRange);
	};

	ajax.size = (_url, _callback) => {
		if(typeof _callback !== 'function')
		{
			_callback = null;
		}
else throw new Error('TODO (w/ callback now)');

		const request = ajax({ url: _url, method: 'HEAD', async: false });

		if(! request)
		{
			return undefined;
		}
		else if(request.statusClass !== 2)
		{
			return undefined;
		}

		const length = request.getResponseHeader('Content-Length');

		if(length === null)
		{
			return null;
		}
		else if(isNaN(length))
		{
			return length;
		}

		return Number(length);
	};

	ajax.exists = (_url, _callback) => {
		if(typeof _callback !== 'function')
		{
			_callback = null;
		}
throw new Error('TODO');
		//const request = ajax({ u
	};

	const responseStatusClass = (_request) => {
		if(isNaN(_request.status))
		{
			return _request.statusClass = null;
		}
		
		return _request.statusClass = Number(_request.status.toString()[0]);
	};
	
	const handleRequest = (_request, _options) => {
		//
		_request.options = _options;
		
		//
		if(! _options.async)
		{
			return _request;
		}
		
		//
		var hadProgress = false;
		var hadComputableProgress = null;
		var hasSize = false;
		var stopped = false;
		var size = -1;
		/*var lastLoaded = 0;
		var loaded = 0;*///see progress-event..

		_request.stop = () => {
			if(stopped)
			{
				return false;
			}
			
			return stopped = true;
		};
		
		//
		const prepareEvent = (_event) => {
			//
			_event.request = _request;
			_event.options = _options;
			
			_event.hadProgress = hadProgress;
			_event.hadComputableProgress = hadComputableProgress;
			_event.hasSize = hasSize;
			_event.size = size;
			
			_event.stop = _request.stop;
			_event.stopped = stopped;
			
			//_event.loaded = loaded;//see onprogress() etc..
			
			//
			if(enabledEvent(_event.type))
			{
				return _event;
			}

			return null;
		};

		const enabledEvent = (_name) => {
			if(! (isInt(_options.callbacks) && _options.callbacks >= 0))
			{
				return true;
			}
			else if(_options.callbacks === 0)
			{
				return false;
			}
			else if(! ((_name = _name.toLowerCase()) in ajax.callbacks))
			{
				return null;
			}

			return ((_options.callbacks & ajax.callbacks[_name]) > 0);
		};
		
		//
		const onfailure = (_event) => {
			if(prepareEvent(_event) === null)
			{
				return null;
			}
			
			_event.originalType = _event.original = _event.type;
			_event.type = 'failure';
			
			if(typeof _options.onfailure === 'function')
			{
				_options.onfailure(_event, _request, _options);
			}
			else// if(typeof _options.callback === 'function')
			{
				_options.callback(_event, _request, _options);
			}
		};
		
		//
		_request.addEventListener('abort', (_event) => {
			if(! stopped)
			{
				if(prepareEvent(_event) === null)
				{
					return null;
				}
				
				if(typeof _options.onabort === 'function')
				{
					_options.onabort(_event, _request, _options);
				}
				else// if(typeof _options.callback === 'function')
				{
					_options.callback(_event, _request, _options);
				}
				
				onfailure(_event);
			}
		});
		
		_request.addEventListener('error', (_event) => {
			if(! stopped)
			{
				if(prepareEvent(_event) === null)
				{
					return null;
				}
				
				if(typeof _options.onerror === 'function')
				{
					_options.onerror(_event, _request, _options);
				}
				else// if(typeof _options.callback === 'function')
				{
					_options.callback(_event, _request, _options);
				}
				
				onfailure(_event);
			}
		});
		
		_request.addEventListener('load', (_event) => {
			if(! hasSize && _request.statusClass === 2 && typeof _request.responseText === 'string')
			{
				hasSize = true;
				size = _request.responseText.length;
			}
			
			if(! stopped)
			{
				if(prepareEvent(_event) === null)
				{
					return null;
				}
				
				if(typeof _options.onload === 'function')
				{
					_options.onload(_event, _request, _options);
				}
				else// if(typeof _options.callback === 'function')
				{
					_options.callback(_event, _request, _options);
				}
			}
		});
		
		_request.addEventListener('loadend', (_event) => {
			_request.stop = Date.now();
			_request.time = (_request.stop - _request.start);
			
			if(! stopped)
			{
				if(prepareEvent(_event) === null)
				{
					return null;
				}
				
				if(typeof _options.onloadend === 'function')
				{
					_options.onloadend(_event, _request, _options);
				}
				else// if(typeof _options.callback === 'function')
				{
					_options.callback(_event, _request, _options);
				}
			}
		});
		
		_request.addEventListener('loadstart', (_event) => {
			if(! stopped)
			{
				if(prepareEvent(_event) === null)
				{
					return null;
				}
				
				if(typeof _options.onloadstart === 'function')
				{
					_options.onloadstart(_event, _request, _options);
				}
				else// if(typeof _options.callback === 'function')
				{
					_options.callback(_event, _request, _options);
				}
			}
		});
		
		_request.addEventListener('progress', (_event) => {
			//
			hadProgress = true;
			
			//
			if(_event.lengthComputable)
			{
				//
				hadComputableProgress = true;
				
				//
				if(! hasSize)
				{
					hasSize = true;
					total = _event.total;
				}
				
				//
				//_event.delta = ((lastLoaded = _event.loaded) - lastLoaded);
				
				//
			}
			else
			{
				//
				hadComputableProgress = false;
			}
			
			if(! stopped)
			{
				if(prepareEvent(_event) === null)
				{
					return null;
				}
				
				if(typeof _options.onprogress === 'function')
				{
					_options.onprogress(_event, _request, _options);
				}
				else// if(typeof _options.callback === 'function')
				{
					_options.callback(_event, _request, _options);
				}
			}
		});
		
		_request.addEventListener('readystatechange', (_event) => {
			if(_request.readyState === 2) // === XMLHttpRequest.HEADERS_RECEIVED
			{
				responseStatusClass(_request);
				
				if(! hasSize)
				{
					const contentLength = Number(_request.getResponseHeader('Content-Length'));
					
					if(! isNaN(contentLength))
					{
						hasSize = true;
						size = contentLength;
					}
				}
			}
			
			if(! stopped)
			{
				if(prepareEvent(_event) === null)
				{
					return null;
				}
				
				if(typeof _options.onreadystatechange === 'function')
				{
					_options.onreadystatechange(_event, _request, _options);
				}
				else// if(typeof _options.callback === 'function')
				{
					_options.callback(_event, _request, _options);
				}
			}
		});
		
		_request.addEventListener('timeout', (_event) => {
			if(! stopped)
			{
				if(prepareEvent(_event) === null)
				{
					return null;
				}
				
				if(typeof _options.ontimeout === 'function')
				{
					_options.ontimeout(_event, _request, _options);
				}
				else// if(typeof _options.callback === 'function')
				{
					_options.callback(_event, _request, _options);
				}
				
				onfailure(_event);
			}
		});
		
		//
		return _request;
	};
	
	//
	module = {
		id: undefined,
		exports: undefined
	};

	//
	library = (_id, _callback, _path = DEFAULT_PATH, _reload = false, _throw = DEFAULT_THROW, _options = null) => {
		return require(_id, _callback, _path, _reload, _throw, _options, true);
	};

	require = (_id, _callback, _path = DEFAULT_PATH, _reload = false, _throw = DEFAULT_THROW, _options = null, _eval = false) => {
		if(typeof _callback !== 'function')
		{
			_callback = null;
		}
		
		if(typeof _path !== 'string')
		{
			if(_path === null)
			{
				_path = '';
			}
			else
			{
				_path = DEFAULT_PATH;
			}
		}

		if(typeof _reload !== 'boolean')
		{
			_reload = false;
		}

		if(typeof _throw !== 'boolean')
		{
			_throw = DEFAULT_THROW;
		}

		if(typeof _eval !== 'boolean')
		{
			_eval = false;
		}

		if(Array.isArray(_id))
		{
			for(var i = 0, j = require.QUEUE.length; i < _id.length; ++i)
			{
				if(typeof _id[i] !== 'string' || _id[i].length === 0)
				{
					if(_throw)
					{
						throw new Error('Invalid _id[' + i + '] argument (not a non-empty String in Array)');
					}
				}
				else
				{
					require.QUEUE[j++] = replaces(((_path ? (_path + '/') : '') + _id[i]), '//', '/', null);
				}
			}

			return require.QUEUE.length;
		}
		else if(typeof _id !== 'string')
		{
			if(_id === null)
			{
				return require.progress(_callback, _path, _reload, _throw, _options);
			}
			else if(_throw)
			{
				throw new Error('Invalid _id argument (neither non-empty String nor Array)');
			}

			return null;
		}
		else if(_path.length > 0 && !(_id.startsWith(_path)))
		{
			var addPath;

			//TODO: (if!)path.resolve() w/ '~' $HOME..
			if(_id[0] === '/')
			{
				addPath = false;
			}
			else if(_id.startsWith('./') || _id.startsWith('../'))
			{
				addPath = false;
			}
			else if(location.protocols)
			{
				addPath = !!(_path.startsWith(false, ... location.protocols));
			}
			else
			{
				addPath = true;
			}

			if(addPath)
			{
				_id = (_path + '/' + _id);
			}
		}

		//
		const mark = (_id[_id.length - 1] === '!');
		var ext, type;

		if(mark)
		{
			_id = _id.slice(0, -1);
		}
		
		const lower = _id.toLowerCase();

		if(lower.endsWith('.json'))
		{
			ext = _id.slice(-5);
			type = 'json';
		}
		else if(lower.endsWith('.js'))
		{
			ext = _id.slice(-3);
			type = 'js';
		}
		else
		{
			_id += (ext = '.js');
			type = 'js';
		}

		if(mark)
		{
			_id += '!';
		}

		//
		if(typeof require[type] !== 'function')
		{
			throw new Error('You can\'t require with type \'' + type + '\'');
		}
		else switch(type)
		{
			case 'js':
				if(! HEAD)
				{
					throw new Error('No <head> element available');
				}
				break;
			case 'json':
				break;
		}

		//
		return require[type](_id, _callback, _reload, _throw, _options, _eval);
	};

	//
	require.QUEUE = [];
	require.CACHE = Object.create(null);

	//
	const replaces = (_string, _from, _to, _repeat = null) => {
		if(_repeat !== null && typeof _repeat !== 'number')
		{
			_repeat = null;
		}

		var compare = _string.valueOf();
		var result;

		do
		{
			result = compare.replaceAll(_from, _to);

			if(result === compare)
			{
				break;
			}
			else if(_repeat !== null && _repeat-- <= 0)
			{
				break;
			}
			else
			{
				compare = result;
			}
		}
		while(true);

		return result;
	};

	library.progress = (_callback, _path = '', _reload = false, _throw = DEFAULT_THROW, _options = null) => {
			return require.progress(_callback, _path, _reload, _throw, _options, true);
	};

	require.progress = (_callback, _path = '', _reload = false, _throw = DEFAULT_THROW, _options = null, _eval = false) => {
		//
		if(typeof _callback !== 'function')
		{
			_callback = null;
		}

		if(typeof _path !== 'string')
		{
			if(_path === null)
			{
				_path = '';
			}
			else
			{
				_path = DEFAULT_PATH;
			}
		}

		if(typeof _reload !== 'boolean')
		{
			_reload = false;
		}

		if(typeof _throw !== 'boolean')
		{
			_throw = DEFAULT_THROW;
		}

		if(typeof _eval !== 'boolean')
		{
			_eval = false;
		}

		if(require.QUEUE.length === 0)
		{
			if(_throw)
			{
				throw new Error('The \'require.QUEUE[]\' is empty');
			}

			return null;
		}

		const queue = [ ... require.QUEUE ];
		const length = queue.length;

		for(var i = 0; i < queue.length; ++i)
		{
			if(_path.length > 0)
			{
				queue[i] = (_path + '/' + queue[i]);
			}

			queue[i] = replaces(queue[i], '//', '/', null);
		}

		//
		var loaded = 0;
		var errors = 0;
		const result = new Array(length);

		const callback = (_event) => {
			if(_event.error)
			{
				return ++errors;
			}

			result[loaded++] = _event.module;
			result[_event.id] = _event.module;

			if(loaded >= length)
			{
				if(_callback)
				{
					_callback({ loaded, errors,
						modules: result,
						ids: queue,
						error: (errors > 0)
					});
				}
			}
		};

		//
		while(require.QUEUE.length > 0)
		{
			require(require.QUEUE.shift(), callback, '', _reload, _throw, _options, _eval);
		}

		//
		return length;
	};

	//
	module = {
		exports: undefined,
		id: null
	};

	//
	library.js = (_id, _callback, _reload = false, _throw = DEFAULT_THROW, _options = null) => {
		return require.js(_id, _callback, _reload, _throw, _options, true);
	};

	require.js = (_id, _callback, _reload = false, _throw = DEFAULT_THROW, _options = null, _eval = false) => {
		//
		if(typeof _callback !== 'function')
		{
			_callback = null;
		}

		//
		var defer;

		if(_id[_id.length - 1] === '!')
		{
			_id = _id.slice(0, -1);
			defer = false;
		}
		else
		{
			defer = DEFAULT_DEFER;
		}

		//
		if(_id in require.CACHE)
		{
			const res = require.CACHE[_id];

			if(_reload)
			{
				if(typeof res === 'object' && res !== null)
				{
					if(! res.__EVAL)
					{
						if(res.parentNode && res.parentNode === HEAD)
						{
							res.parentNode.removeChild(res, null);
						}
						else
						{
							delete require.CACHE[_id];

							if(_throw)
							{
								throw new Error('Unexpected .parentNode');
							}

							return undefined;
						}
					}
				}

				delete require.CACHE[_id];
			}
			else
			{
				if(_callback)
				{
					_callback({ type: 'require', id: _id,
						type: 'js', cached: true,
						module: res,
						error: false
					}, res);
				}

				return res;
			}
		}

		//
		var callback;
		var result;

		if(_eval)
		{
			//
			const handle = (_request, _event = null) => {
				if(_request.statusClass !== 2)
				{
					if(_throw)
					{
						throw new Error('Unable to require(\'' + _request.responseURL + '\' (HTTP ' + _request.status + ': ' + _request.statusText + ')');
					}
					else
					{
						res = undefined;
					}
					
					return res;
				}

				//
				var res = _request.responseText;

				//
				const originalModule = module;
				module = { id: _id };

				//
				try
				{
					module.exports = undefined;
					res = eval.call(null, res);

					if(typeof module.exports !== 'undefined')
					{
						res = module.exports;
					}
					
					module.exports = res;
					require.CACHE[_id] = res;
					require.CACHE[_id].__EVAL = true;
				}
				catch(_error)
				{
					if(_throw)
					{
						throw _error;
					}
					else
					{
						delete require.CACHE[_id];
					}

					res = undefined;
				}
				
				//setTimeout(() => {
					module = originalModule;
				//}, 0);

				return res;
			};
			
			//
			callback = (_event, _request) => {
				var res, err;
				
				if(_event.type === 'load')
				{
					res = handle(_request, _event);
					err = null;
				}
				else if(_event.type === 'failure')
				{
					res = undefined;
					err = new Error('Unable to require(\'' + _request.responseURL + '\' (HTTP ' + _request.status + ': ' + _request.statusText + ')');
				}
				
				if(err)
				{
					if(_throw)
					{
						throw err;
					}
					else if(_callback)
					{
						_callback({ id: _id, url: _request.responseURL,
							type: 'js', module: null, error: err,
							request: _request, start: _request.start, stop: _request.stop, time: _request.time,
							status: _request.status, statusClass: _request.statusClass, statusText: _request.statusText
						});
					}
				}
				else if(_callback)
				{
					_callback({ id: _id, url: _request.responseURL,
						type: 'js', module: res, error: null,
						request: _request, start: _request.start, stop: _request.stop, time: _request.time,
						status: _request.status, statusClass: _request.statusClass, statusText: _request.statusText }, res);
				}
				
				return res;
			};

			//
			result = ajax({ url: _id,
				callback: (_callback ? callback : null),
				mime: 'application/javascript' });

			if(!_callback)
			{
				result = handle(result, null);
			}

			return result;
		}

		//
		callback = (_event) => {
			result.removeEventListener('load', callback);
			result.removeEventListener('error', callback);

			result.stop = Date.now();
			result.time = (result.stop - result.start);

			const onload = () => {
				//
				require.CACHE[_id] = result;
				require.CACHE[_id].__EVAL = false;

				//
				if(_callback)
				{
					_callback({ id: _id,
						type: 'js',
						module: result,
						error: false,
						start: result.start, stop: result.stop, time: result.time
					}, result);
				}

				//
				if(typeof window.emit === 'function')
				{
					window.emit('require', {
						type: 'require',
						id: _id, type: 'js',
						module: result,
						start: result.start, stop: result.stop, time: result.time
					});

					window.emit(_id, {
						type: 'require',
						id: _id, type: 'js',
						module: result,
						start: result.start, stop: result.stop, time: result.time
					});
				}
			};

			const onerror = () => {
				//
				HEAD.removeChild(result);
				delete require.CACHE[_id];

				//
				if(_throw)
				{
					throw new Error('Unable to require(\'' + _id + '\'');
				}
				else if(_callback)
				{
					_callback({ id: _id,
						type: 'js',
						module: null,
						error: true,
						start: result.start,
						stop: result.stop,
						time: result.time
					});
				}
			};

			switch(_event.type)
			{
				case 'load':
					return onload();
				case 'error':
					return onerror();
				default:
					return null;
			}
		};

		result = document.createElement('script');

		result.addEventListener('load', callback, { once: true });
		result.addEventListener('error', callback, { once: true });

		result.async = false;
		result.defer = !!defer;

		result.start = Date.now();
		result.charset = DEFAULT_CHARSET;
		result.src = _id;
		HEAD.appendChild(result);

		return result;
	};

	require.json = (_id, _callback, _reload = false, _throw = DEFAULT_THROW, _options, _eval) => {
		_eval = null;

		if(typeof _callback !== 'function')
		{
			_callback = null;
		}

		if(_id[_id.length - 1] === '!')
		{
			_id = _id.slice(0, -1);
		}

		if(_id in require.CACHE)
		{
			if(_reload)
			{
				delete require.CACHE[_id];
			}
			else
			{
				const res = require.CACHE[_id];

				if(_callback)
				{
					_callback({ id: _id,
						type: 'json', module: res,
						request: null, error: false }, res);
				}

				if(typeof window.emit === 'function')
				{
					window.emit('require', { type: 'require', id: _id, type: 'json', module: res });
					window.emit(_id, { type: 'require', id: _id, type: 'json', module: res });
				}

				return res;
			}
		}

		const handle = (_event, _request = _event.request) => {
			var module, error;
			
			if(_event.type === 'failure' || result.statusClass !== 2)
			{
				error = new Error('Couldn\'t fetch \'' + _id + '\' (HTTP ' + result.status + ': ' + result.statusText + ')');
				
				if(_throw)
				{
					throw error;
				}
				else
				{
					module = undefined;
				}
			}
			else try
			{
				module = JSON.parse(result.responseText);
				error = null;
			}
			catch(_error)
			{
				if(_throw)
				{
					throw _error;
				}
				else
				{
					error = _error;
					module = undefined;
				}
			}

			if(_callback)
			{
				_callback({ id: _id, type: 'json', module, data: result.responseText, error, request: _request, time: _request.time,
					start: _request.start, stop: _request.stop, status: _request.status, statusClass: _request.statusClass, statusText: _request.statusText }, module);
			}

			if(! error && typeof window.emit === 'function')
			{
				window.emit('require', { type: 'require', id: _id, type: 'json', module, data: result.responseText, error: null, request: _request,
					start: _request.start, stop: _request.stop, time: _request.time,
					status: _request.status, statusClass: _request.statusClass, statusText: _request.statusText });

				window.emit(_id, { type: 'require', id: _id, type: 'json', module, data: result.responseText, error: null, request: _request,
					start: _request.start, stop: _request.stop, time: _request.time,
					status: _request.status, statusClass: _request.statusClass, statusText: _request.statusText });
			}

			return module;
		};
		
		const callback = (_event, _request = _event.request) => {
			switch(_event.type)
			{
				case 'failure':
				case 'load':
					return handle(_event, _request);
			}
		};

		var result = ajax(Object.assign({}, _options, {
			url: _id,
			callback: (_callback ? callback : null),
			mime: 'application/json'
		}));

		if(! _callback)
		{
			return handle({ type: 'none' }, result);
		}

		return result;
	};

	require.reset = require.clear = () => {
		//TODO/
		//require.CACHE = Object.create(null);
		//and all <script> to be removed..
		//etc.?
	};

	//
	const afterAutoload = (_autoload, _event, _event_original) => {
		setTimeout(() => {
			window.emit('ready', { type: 'ready', autoload: _autoload, config });
		}, 0);
	};

	const onAutoload = (_event) => {
		//
		if(! Array.isArray(_event.module))
		{
			throw new Error('Invalid \'autoload.json\'');
		}
		else
		{
			require(_event.module);
			require(null, (_e) => {
				afterAutoload(_event.module, _e, _event);
			});
		}
	};

	const onConfig = () => {
		//
		if(typeof config !== 'object' || config === null)
		{
			throw new Error('Couldn\'t load \'config.json\'');
		}

		//
		if(config.behavior.hideAddressBar)
		{
			window.addEventListener('ready', () => {
				setTimeout(() => {
					window.scrollTo(0, 1);
				}, 0);
			}, { once: true });
		}

		//
		/*if(typeof config.behavior.fullScreen === 'boolean')
		{
			document.setFullScreen(config.behavior.fullScreen);
		}*/

		//
		require('autoload.json', onAutoload);
	};

	//
	window.addEventListener('load', (_event) => {
		require('js/event.js', (_ev1) => {
			require('config.json!', (_ev2) => {
				if(typeof _ev2.module === 'object' && _ev2.module !== null)
				{
					window.emit('config', { type: 'config', config: (config = _ev2.module) });
			
					require('network!', () => {
						require('init!', onConfig);
					});
				}
				else
				{
					throw new Error('Couldn\'t load \'config.json\'');
				}
			});
		});
	}, { once: true });

})();

