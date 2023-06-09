// wichtig: 'Page.Column'-klasse und die inhalts-einteilung dynamisch an (wnd-/*parent*-)groesze angepasst,
// w/ dynamic change @ window.onload(), etc...
//
(function()
{

	//
	const DEFAULT_THROW = true;
	const DEFAULT_CONTEXT = null;
	const DEFAULT_RELATIVE = true;
	const DEFAULT_MENU_OUT_ITEMS = true;
	const DEFAULT_OSD = true;
	
	//
	Page = class Page
	{
		static getPath(_link, _throw = DEFAULT_THROW)
		{
			if(! isString(_link, false))
			{
				if(_throw)
				{
					throw new Error('Invalid _link argument');
				}
				
				return null;
			}
			else if(_link[0] === '#' && _link[1] !== '~')
			{
				return _link;
			}
			else if(_link.startsWith('javascript:'))
			{
				return _link;
			}
			else if(_link[0] === '/' || _link.startsWith('./') || _link.startsWith('../'))
			{
				return _link;
			}
			else if(_link[0] === '~')
			{
				const homeConfig = Page.checkHomeConfig();
				
				if(homeConfig)
				{
					_link = homeConfig.path + '/' + _link.substr(1);

					if(homeConfig.extension)
					{
						if(typeof homeConfig.extension === 'string')
						{
							homeConfig.extension = [ homeConfig.extension ];
						}

						var found = false;

						for(var i = 0; i < homeConfig.extension.length; ++i)
						{
							if(_link.endsWith(homeConfig.extension[i]))
							{
								found = true;
								break;
							}
						}

						if(! found)
						{
							_link += '/';
						}
					}
					else
					{
						_link += '/';
					}

					_link = path.resolve(_link);
				}
			}
			
			return _link;
		}

		static renderHomePath(_path, _throw = DEFAULT_THROW)
		{
			var home = Page.checkHomeConfig();
			
			if(home)
			{
				if((home = home.path)[home.length - 1] !== path.sep)
				{
					home += path.sep;
				}
			}
			else
			{
				return _path;
			}

			if(typeof _path === 'string')
			{
				_path = path.resolve(_path);
			}
			else if(_throw)
			{
				throw new Error('Invalid _path argument');
			}
			else
			{
				return null;
			}

			if(_path === home)
			{
				return '~';
			}
			else if(_path.startsWith(home))
			{
				return '~' + _path.substr(home.length - 1);
			}

			return _path;
		}

		static parseHomePath(_path)
		{
			var home = Page.checkHomeConfig();

			if(home)
			{
				if((home = home.path)[home.length - 1] !== path.sep)
				{
					home += path.sep;
				}
			}
			else
			{
				return _path;
			}

			if(typeof _path === 'string')
			{
				_path = path.normalize(_path);
			}
			else if(_throw)
			{
				throw new Error('Invalid _path argument');
			}
			else
			{
				return null;
			}

			if(_path === '~')
			{
				return home;
			}
			else if(_path.startsWith('~/'))
			{
				return home + _path.substr(2);
			}

			return _path;
		}
		
		static checkHomeConfig()
		{
			const result = Object.create(null);

			if(result.path = document.getVariable('home-path'))
			{
				result.path = path.resolve(result.path, true);
			}
			else
			{
				return null;
			}

			if(isArray(result.extension = document.getVariable('home-extension', true)), false) for(var i = 0; i < result.extension.length; ++i)
			{
				if(result.extension[i][0] !== '.')
				{
					result.extension[i] = '.' + result.extension[i];
				}
			}
			else
			{
				result.extension = null;
			}

			return result;
		}

		static get(_link, _target = Page.target, _callback, _options, _type = document.getVariable('page-fallback-type'), _animate = document.getVariable('page-data-duration', true), _delay = document.getVariable('data-delay', true), _delete_mul = document.getVariable('page-data-delete-mul', true), _throw = DEFAULT_THROW)
		{
			if(typeof _throw !== 'boolean')
			{
				_throw = DEFAULT_THROW;
			}
			
			if(typeof _callback !== 'function' && typeof _callback !== 'boolean')
			{
				_callback = document.getVariable('page-callback', true);
			}
			
			if(! (_link = Page.getPath(_link, _throw)))
			{
				return null;
			}
			
			if(_link[0] === '#')
			{
				return Page.getHash(_link.substr(1), _callback, null, _throw);
			}
			else if(_link.startsWith('javascript:'))
			{
				return Page.executeJavaScript(_link, _callback, DEFAULT_CONTEXT, _throw);
			}

			return Page.getLink(_link, _target, _callback, _options, _type, _animate, _delay, _delete_mul, _throw);
		}

		static getHash(_link, _callback, _reload = document.getVariable('page-reload-hash', true), _throw = DEFAULT_THROW)
		{
			if(typeof _throw !== 'boolean')
			{
				_throw = DEFAULT_THROW;
			}
			
			if(! isString(_link, false))
			{
				if(_throw)
				{
					throw new Error('Invalid _link argument');
				}

				return '';
			}
			else if(typeof _callback !== 'function')
			{
				_callback = null;
			}

			if(typeof _reload !== 'boolean')
			{
				_reload = document.getVariable('page-reload-hash', true);
			}

			if(_link === location.hash.substr(1))
			{
				if(_reload)
				{
					location.hash = '';
				}
				else
				{
					return _link;
				}
			}

			//
			location.hash = ('#' + _link);

			//
			call(_callback, { type: 'getHash', link: _link, reload: _reload, error: false });

			//
			return _link;
		}
		
		static executeJavaScript(_string, _callback, _context = DEFAULT_CONTEXT, _throw = DEFAULT_THROW)
		{
			if(! document.getVariable('page-scripting', true))
			{
				if(_throw)
				{
					throw new Error('JavaScript execution is not allowed here, this way');
				}
				
				return undefined;
			}
			else if(typeof _string !== 'string')
			{
				throw new Error('Invalid _string argument');
			}
			else if(typeof _callback !== 'function')
			{
				_callback = null;
			}

			if(_string.startsWith('javascript:'))
			{
				_string = _string.substr(11);
			}
			
			var result;
			
			try
			{
				result = eval.call(_context, _string);
				osd('ok');
				call(_callback, { type: 'executeJavaScript', error: null, result });
			}
			catch(_error)
			{
				osd(`<span style="color: red;">error</span><span style="font-size: 0.32em; color: blue;"><br>${_error.message}</span>`, {
					duration: document.getVariable('ajax-osd-duration', true),
					timeout: document.getVariable('ajax-osd-timeout', true)
				});

				call(_callback, { type: 'executeJavaScript', error: _error, result: undefined });

				if(_throw)
				{
					throw _error;
				}
				
				result = _error;
			}
			
			return result;
		}

		static adaptPath(_path, _dirname = null, _response_url, _throw = DEFAULT_THROW)
		{
			//
			if(typeof _path !== 'string')
			{
				if(_throw)
				{
					throw new Error('Invalid _path argument');
				}

				return null;
			}
			else if(_path.length === 0)
			{
				return '/';
			}
			else if(path.isAddress(_path, _throw))
			{
				_path = path.normalize(_path);
			}

			//
			if(! isString(_dirname, false))
			{
				_dirname = null;
			}
			else if(_dirname[_dirname.length - 1] !== '/')
			{
				_dirname += '/';
			}

			//
			if(_dirname === null)
			{
				return _path;
			}
			else if(path.isAbsolute(_path))
			{
				return _path;
			}
			else if(_path === '.' || _path === '..')
			{
				return _path + '/';
			}

			return path.normalize(_dirname + _path);
		}

		static getLink(_link, _target = Page.target, _callback, _options, _type = document.getVariable('page-fallback-type'), _animate = document.getVariable('page-data-duration', true), _delay = document.getVariable('data-delay', true), _delete_mul = document.getVariable('page-data-delete-mul', true), _throw = DEFAULT_THROW)
		{
			if(typeof _throw !== 'boolean')
			{
				_throw = DEFAULT_THROW;
			}
			
			if(typeof _callback !== 'function')
			{
				_callback = null;
			}
			
			if(! _target)
			{
				_target = Page.target;
			}
			
			if(isString(_target, false))
			{
				_target = document.getElementById(_target);
			}
			
			if(! _target)
			{
				call(_callback, { type: 'getLink', error: true });
				
				if(_throw)
				{
					throw new Error('Invalid _target argument');
				}

				return undefined;
			}
			
			if(isString(_type, false)) switch(_type = _type.toLowerCase())
			{
				case 'html':
				case 'text':
					break;
				default:
					_type = document.getVariable('page-fallback-type').toLowerCase();
					break;
			}
			else
			{
				_type = document.getVariable('page-fallback-type').toLowerCase();
			}

			const originalLink = (isString(_link, false) ? _link : null);
			
			if(originalLink === null)
			{
				call(_callback, { type: 'getLink', error: true });
				
				if(_throw)
				{
					throw new Error('Invalid _link argument');
				}

				return null;
			}
			else
			{
				_link = Page.getPath(_link, _throw);
			}

			if(_link[0] === '#')
			{
				return Page.getHash(_link, _callback, null, _throw);
			}
			else if(_link.startsWith('javascript:'))
			{
				return Page.executeJavaScript(_link.substr(11), _callback, DEFAULT_CONTEXT, _throw);
			}

			if(typeof _callback !== 'function' && typeof _callback !== 'boolean')
			{
				_callback = document.getVariable('page-callback', true);
			}
			
			var doAnimate;
			
			if(! (isInt(_animate) && _animate >= 0))
			{
				if(_animate === false)
				{
					_animate = null;
					doAnimate = false;
				}
				else
				{
					_animate = document.getElement('page-data-duration');
					doAnimate = true;
				}
			}
			else
			{
				doAnimate = true;
			}

			if(! (isInt(_delay) && _delay >= 0))
			{
				_delay = 0;
			}
			
			if(_delete_mul !== null && !(isNumber(_delete_mul) && _delete_mul > 0))
			{
				_delete_mul = document.getVariable('page-data-delete-mul', true);
			}
			
			const animateIf = (_request) => {
				//
				const url = new URL(_request.responseURL, location.href);
				const local = (url.origin === location.origin);

				//
				//setValue(_request, _type, '', false, null);
				_target.innerHTML = '';
				
				//
				var data = _request.responseText;
				
				//
				var script = '';
				var style = '';
				const scripts = [];
				const styles = [];
				var extracted;
				
				if(_type === 'html' && local)
				{
					const dirname = (DEFAULT_RELATIVE ? path.dirname(_request.responseURL) : null);
					extracted = html.extract(data, [ 'script', 'style', 'link' ], true, 1, _throw);
					data = extracted.shift();
					var item;

					for(var i = 0, src = 0, href = 0; i < extracted.length; ++i)
					{
						switch(extracted[i]['*'])
						{
							case 'link':
								if(! isString(extracted[i].href, false))
								{
									if(_throw)
									{
										throw new Error('A <link> tag needs to have a .href value');
									}
									else
									{
										extracted.splice(i--, 1);
									}
								}
								else
								{
									//
									extracted[i].href = Page.adaptPath(extracted[i].href, dirname, _request.responseURL);

									//
									styles[href++] = extracted[i];
								}
								break;
							case 'style':
								if(isString((item = extracted.splice(i--, 1)[0]).style, false))
								{
									style += item.style;
								}
								else if(_throw)
								{
									throw new Error('A <style> tag needs to have a payload');
								}
								break;
							case 'script':
								if(! isString(extracted[i].src, false))
								{
									if(isString((item = extracted.splice(i--, 1)[0]).script, false))
									{
										script += item.script;
									}
									else if(_throw)
									{
										throw new Error('Invalid <script> (got neither a .src nor data)');
									}
								}
								else
								{
									//
									extracted[i].src = Page.adaptPath(extracted[i].src, dirname, _request.responseURL);

									//
									scripts[src++] = extracted[i];
								}
								break;
							default:
								if(_throw)
								{
									throw new Error('Only <link/style/script> is allowed to be extracted, not \'' + extracted[i]['*'] + '\')');
								}

								script = style = '';
								scripts.length = 0;
								styles.length = 0;
								break;
						}
					}
					
					extracted = true;
				}
				else
				{
					extracted = false;
					script = style = '';
					scripts.length = 0;
					styles.length = 0;
				}

				//
				if(extracted)
				{
					var node;

					for(var i = 0; i < styles.length; ++i)
					{
						node = document.createElement('link');

						for(const idx in styles[i])
						{
							if(idx === '*')
							{
								continue;
							}
							else if(idx === styles[i]['*'])
							{
								node.innerHTML = styles[i][styles[i]['*']];
							}
							else
							{
								node.setAttribute(idx, styles[i][idx]);
							}
						}

						if(! node.id)
						{
							node.id = node.href + '#css[' + i + ']';
							//node.id = _request.responseURL + '#css[' + i + ']';
						}

						styles[i] = node;
					}

					for(var i = 0; i < scripts.length; ++i)
					{
						node = document.createElement('script');

						for(const idx in scripts[i])
						{
							if(idx === '*')
							{
								continue;
							}
							else if(idx === scripts[i]['*'])
							{
								node.innerHTML = scripts[i][scripts[i]['*']];
							}
							else
							{
								node.setAttribute(idx, scripts[i][idx]);
							}
						}

						if(! node.id)
						{
							node.id = node.src + '#js[' + i + ']';
							//node.id = _request.responseURL + '#js[' + i + ']';
						}

						scripts[i] = node;
					}

					if(style.length > 0)
					{
						node = document.createElement('style');
						node.id = Page.adaptPath(_request.responseURL, null, null, _throw) + '#css';
						//node.id = _request.responseURL + '#css';
						node.innerHTML = style;
						styles.push(node);
					}

					style = null;

					if(script.length > 0)
					{
						node = document.createElement('script');
						node.id = Page.adaptPath(_request.responseURL, null, null, _throw) + '#js';
						//node.id = _request.responseURL + '#js';
						node.innerHTML = script;
						script = node;
					}
					else
					{
						script = null;
					}
				}

				//
				if(document.getVariable('bionic', true) && _type === 'html')
				{
					data = bionic(data);
				}

				//
				if(doAnimate)
				{
					_target.blink({
						count: document.getVariable('page-blink-count', true),
						border: false,
						duration: document.getVariable('page-blink-duration', true),
						delay: 0,
						transform: false
					});
				}

				//
				setTimeout(() => {
					//
					for(const idx in Page.ID)
					{
						if(Page.ID[idx].parentNode)
						{
							Page.ID[idx].parentNode.removeChild(Page.ID[idx]);
						}

						delete Page.ID[idx];
					}

					//
					const cb = (_elem, _error) => {
						if(_elem)
						{
							_elem.removeEventListener('load', _elem._load);
							delete _elem._load;
							_elem.removeEventListener('error', _elem._error);
							delete _elem._error;
						}

						if(_error)
						{
							if(_elem)
							{
								_elem.parentNode.removeChild(_elem);
							}

							if(_throw)
							{
								throw new Error('Failed loading style \'' + _elem.href + '\'');
							}
						}
						else if(_elem)
						{
							Page.ID[_elem.id] = _elem;
						}
					};

					if(styles.length === 0)
					{
						cb(null, null);
					}
					else for(var i = 0; i < styles.length; ++i)
					{
						const s = styles[i];

						s.addEventListener('load', s._load = () => { cb(s, false); }, { once: true });
						s.addEventListener('error', s._error = () => { cb(s, true); }, { once: true });

						HEAD.appendChild(s);
					}

					//
					setValue(_request, _type, data, doAnimate, (_e) => {
						//
						var rest = scripts.length;
						const cb = (_elem, _error) => {
							if(_elem)
							{
								_elem.removeEventListener('load', _elem._load);
								delete _elem._load;
								_elem.removeEventListener('error', _elem._error);
								delete _elem._error;
							}

							if(_error)
							{
								if(_elem)
								{
									_elem.parentNode.removeChild(_elem);
								}

								if(_throw)
								{
									throw new Error('Failed loading script \'' + _elem.src + '\'');
								}
							}
							else if(_elem)
							{
								Page.ID[_elem.id] = _elem;
							}

							if(--rest <= 0)
							{
								if(script)
								{
									HEAD.appendChild(script);
									Page.ID[script.id] = script;
									script = null;
								}
							}
						};

						if(scripts.length === 0)
						{
							cb(null, null);
						}
						else for(var i = 0; i < scripts.length; ++i)
						{
							const s = scripts[i];

							s.addEventListener('load', s._load = () => { cb(s, false); }, { once: true });
							s.addEventListener('error', s._error = () => { cb(s, true); }, { once: true });

							HEAD.appendChild(s);
						}

						//
						call(_callback, { error: false, type: 'page', href: _request.responseURL, link: _link, originalLink, event: _e, type: _type, local });
						window.emit('page', { error: false, type: 'page', event: _e, href: _request.responseURL, link: _link, originalLink, type: _type, local });
					});
				});

				//
				return _request.responseText;
			};

			const checkType = (_request, _throw = DEFAULT_THROW) => {
				var result = _request.getResponseHeader('Content-Type');

				if(result === null)
				{
					switch(_type = _type.toLowerCase())
					{
						case 'html':
						case 'text':
							result = _type;
							break;
						default:
							result = null;
							break;
					}
				}
				else
				{
					result = result.toLowerCase();
					
					if(result.startsWith('text/html'))
					{
						result = 'html';
					}
					else if(result.startsWith('text/plain'))
					{
						result = 'text';
					}
					else switch(_type = _type.toLowerCase())
					{
						case 'html':
						case 'text':
							result = _type;
							break;
						default:
							result = null;
							break;
					}
				}
				
				if(! result)
				{
					if(_throw)
					{
						throw new Error('Invalid _type [ "html", "text" ], and no \'Content-Type\' header defined');
					}
					
					return document.getVariable('page-fallback-type').toLowerCase();
				}

				return result;
			};

			const setValue = (_request, _type, _value = _request.responseText, _anim = doAnimate, _cb) => {
				const opacityIn = document.getVariable('page-opacity-duration-in', true);
				const opacityOut = document.getVariable('page-opacity-duration-out', true);

				_target.setStyle('opacity', '0', opacityOut, () => {
					_target.setStyle('opacity', '1', opacityIn);
				});

				switch(_type)
				{
					case 'html':
						if(document.getVariable('page-text-white-space'))
						{
							if('_originalWhiteSpace' in _target)
							{
								_target.style.setProperty('white-space', _target._originalWhiteSpace);
								delete _target._originalWhiteSpace;
							}
						}

						if(! ('innerHTML' in _target))
						{
							throw new Error('Invalid _type (no .innerHTML defined in _target)');
						}
						else if(_anim)
						{
							_target.innerHTML = '';
							_target.setHTML(_cb, _value, _animate, _delay, _delete_mul, 'innerHTML', _throw);
						}
						else
						{
							_target.innerHTML = _value;
							
							if(typeof _cb === 'function')
							{
								call(_cb, { type: 'setValue', data: _value, type: _type, animated: _anim });
							}
						}
						break;
					case 'text':
						if(document.getVariable('page-text-white-space'))
						{
							if(! ('_originalWhiteSpace' in _target))
							{
								_target._originalWhiteSpace = _target.style.whiteSpace;
							}

							_target.style.setProperty('white-space', document.getVariable('page-text-white-space'));
						}

						if('textContent' in _target)
						{
							if(_anim)
							{
								_target.textContent = '';
								_target.setText(_cb, _value, _animate, _delay, _delete_mul, 'textContent', _throw);
							}
							else
							{
								_target.textContent = _value;

								if(typeof _cb === 'function')
								{
									call(_cb, { type: 'setValue', data: _value, type: _type, animated: _anim });
								}
							}
						}
						else if('innerText' in _target)
						{
							if(_anim)
							{
								_target.innerText = '';
								_target.setText(_cb, _value, _animate, _delay, _delete_mul, 'innerText', _throw);
							}
							else
							{
								_target.innerText = _value;

								if(typeof _cb === 'function')
								{
									call(_cb, { type: 'setValue', data: _value, type: _type, animated: _anim });
								}
							}
						}
						else
						{
							throw new Error('Invalid _type (neither .innerText nor .textContent defined in _target)');
						}
						break;
					default:
						throw new Error('Invalid _type [ "html", "text" ]');
				}
				
				return _value;
			};
			
			const callback = (_event, _request, _options) => {
				if(_request.statusClass !== 2)
				{
					ajax.osd(_options.method, _request.status, (_request.statusText || 'error'), getURL());
					call(_callback, { type: 'getLink', error: true });
					
					if(_throw)
					{
						throw new Error('Couldn\'t load link \'' + (_request.responseURL || _link) + '\': [' + _request.status + '] ' + _request.statusText);
					}
					
					return result.status;
				}
				else if(_type = checkType(_request, _throw))
				{
					ajax.osd(_options.method, _request.status, (_request.statusText || 'ok'), getURL());
					Page.nextURL(_request.responseURL || _link);

					if(originalLink[0] === '~')
					{
						const url = new URL(Page.originalBase);
						url.hash = originalLink;

						if(url.href !== location.href)
						{
							Page.changeURL(url.href);
						}
					}
					else if(document.getVariable('page-url-change', true))
					{
						Page.changeURL(_request.responseURL || _link);
					}
					else
					{
						const url = new URL(location.href);
						url.hash = '';

						if(url.href !== location.href)
						{
							Page.changeURL(url.href);
						}
					}
				}
				else
				{
					call(_callback, { type: 'getLink', error: true });
			throw new Error('DEBUG');
					return;
				}

				call(_callback, { type: 'getLink', error: false });
				return animateIf(_request);
			};
			
			const getURL = () => {
				if(originalLink[0] === '~')
				{
					return originalLink;
				}
				else if(result && result.responseURL)
				{
					return result.responseURL;
				}

				return _link;
			};

			const result = Page.loadFile(_link, (_callback ? callback : null), _options, _throw);
			
			if(_callback)
			{
				return result;
			}
			else if(result.statusClass !== 2)
			{
				ajax.osd(result.options.method, result.status, (result.statusText || 'error'), getURL());
				
				call(_callback, { type: 'getLink', error: true });
				
				if(_throw)
				{
					throw new Error('Couldn\'t load link \'' + (result.responseURL || _link) + '\': [' + result.status + '] ' + result.statusText);
				}
				
				return result.status;
			}
			else if(_type = checkType(result, _throw))
			{
				ajax.osd(result.options.method, result.status, (result.statusText || 'ok'), getURL());
				Page.nextURL(result.responseURL || _link);

				if(originalLink[0] === '~')
				{
					const url = new URL(Page.originalBase);
					url.hash = originalLink;

					if(url.href !== location.href)
					{
						Page.changeURL(url.href);
					}
				}
				else if(document.getVariable('page-url-change', true))
				{
					Page.changeURL(result.responseURL || _link);
				}
				else
				{
					const url = new URL(location.href);
					url.hash = '';

					if(url.href !== location.href)
					{
						Page.changeURL(url.href);
					}
				}
			}
			else
			{
	throw new Error('DEBUG');
				return;
			}
			
			//
			call(_callback, { type: 'getLink', error: false });
			
			//
			return animateIf(result);
		}

		static loadFile(_url, _callback, _options)
		{
			if(typeof _callback !== 'function')
			{
				_callback = null;
			}
			
			if(! isObject(_options))
			{
				_options = {};
			}
			
			if(typeof _options.osd !== 'boolean')
			{
				_options.osd = false;
			}
			
			if(typeof _options.console !== 'boolean')
			{
				_options.console = false;
			}
			
			return ajax({ url: _url, callback: _callback, ... _options });
		}

		static get target()
		{
			const result = document.getElementById(document.getVariable('page-target'));

			if(!result)
			{
				throw new Error('--page-target ' + document.getVariable('page-target').quote() + ' not available (ID)');
			}

			return result;
		}

		static get URL()
		{
			return Page.originalBase;
		}

		static set URL(_value)
		{
			if(is(_value, 'URL'))
			{
				_value = _value.href;
			}
			else if(typeof _value === 'string')
			{
				_value = new URL(_value, location.href).href;
			}
			else
			{
				return false;
			}

			history.replaceState(null, null, _value);
			return true;
		}

		static changeHash(_hash, _passive = true, _resolve = true)
		{
			if(is(_hash, 'URL'))
			{
				_hash = _hash.hash;
			}

			if(typeof _hash === 'string')
			{
				if(_hash[0] !== '#')
				{
					_hash = '#' + _hash;
				}

				window.setTimeout(() => {
					Menu.selectItem(_hash);
				}, 0);

				if(_passive)
				{
					return Page.URL = new URL(_hash, (_resolve ? location.href : location.origin)).href;
				}

				location.hash = _hash;
			}
			else
			{
				return false;
			}

			return true;
		}

		static changeURL(_href, _passive = true, _resolve = true)
		{
			if(is(_href, 'URL'))
			{
				_href = _href.href;
			}
			else if(typeof _href === 'string')
			{
				_href = new URL(_href, (_resolve ? location.href : location.origin)).href;
			}
			else
			{
				return false;
			}

			if(_href === location.href)
			{
				return false;
			}
			else
			{
				setTimeout(() => {
					Menu.selectItem(_href);
				}, 0);
			}

			if(_passive)
			{
				return Page.URL = _href;
			}
			else
			{
				location.href = _href;
			}

			return true;
		}
		
		static onhashchange(_event)
		{
			//
			const href = { new: _event.newURL, old: (_event.oldURL || location.href) };
			//const href = { new: _event.newURL, old: (Page.History.length === 0 ? _event.oldURL : Page.History[Page.History.length - 1]) };
			const hash = { new: Page.extractHash(href.new), old: Page.extractHash(href.old) };
			const link = { new: Page.extractURL(href.new), old: Page.extractURL(href.old) };

			//
			if(hash.new === '#' || hash.new.length === 0)
			{
				Page.target.scrollTo(0, 0);
				return '#';
			}
			else if(hash.new[1] === '~' && hash.new.length > 1)
			{
				const cb = (_e) => {
					if(_e.error)
					{
						Page.changeURL(href.old, true);
					}
					else
					{
						Page.changeHash(hash.new, true);
					}
				};
				
				return Page.getLink(hash.new.substr(1), Page.target, cb);
			}

			//
			const elem = document.getElementById(hash.new.substr(1));

			if(! elem)
			{
				return Page.changeHash(hash.old, true);
			}
			else
			{
				Page.nextURL(href.new);
			}
			
			//
			elem.scrollIntoView({
				block: document.getVariable('page-scroll-block'),
				inline: document.getVariable('page-scroll-inline')
			});

			if(! (elem.IN || elem.OUT))
			{
				elem.blink({ count: document.getVariable('page-blink-count', true), border: false });
			}
			
			//
			return hash.new;
		}
		
		static extractURL(_url, _throw = DEFAULT_THROW)
		{
			if(typeof _throw !== 'boolean')
			{
				_throw = DEFAULT_THROW;
			}
			
			if(typeof _url !== 'string')
			{
				if(_throw)
				{
					throw new Error('Invalid _url argument');
				}
				
				return null;
			}
			else if(_url.length === 0 || _url === '#')
			{
				return '';
			}
			else if(_url[0] === '#')
			{
				return '';
			}
			
			const idx = _url.lastIndexOf('#');
			
			if(idx === -1)
			{
				return _url;
			}
			
			return _url.substr(0, idx);
		}
		
		static extractHash(_url, _throw = DEFAULT_THROW)
		{
			if(typeof _throw !== 'boolean')
			{
				_throw = DEFAULT_THROW;
			}
			
			if(typeof _url !== 'string')
			{
				if(_throw)
				{
					throw new Error('Invalid _url argument');
				}
				
				return '#';
			}
			else if(_url.length === 0 || _url === '#')
			{
				return '#';
			}
			else if(_url[0] === '#')
			{
				return _url;
			}

			const idx = _url.lastIndexOf('#');
			
			if(idx === -1)
			{
				return '#';
			}
			
			return _url.substr(idx);
		}
		
		static nextURL(_value, _max_length = document.getVariable('page-history-length', true), _throw = DEFAULT_THROW)
		{
			if(DEFAULT_MENU_OUT_ITEMS)
			{
				setTimeout(() => {
//					Menu.outItems();
				}, 0);
			}

			if(typeof _throw !== 'boolean')
			{
				_throw = DEFAULT_THROW;
			}
			
			if(! (isInt(_max_length) && _max_length >= 0))
			{
				_max_length = document.getVariable('page-history-length', true);
			}

			if(! document.getVariable('page-history', true))
			{
				_max_length = 0;
			}
			
			if(_max_length <= 0)
			{
				Page.History.length = 0;
				return false;
			}
			else
			{
				Page.History.remove(_value);
			}

			if(Page.History.length > (_max_length - 1))
			{
				Page.History.splice(0, Page.History.length - _max_length + 1)
			}
			
			Page.History.push(_value);
			return true;
		}

		static onclick(_event, _target = _event.target)
		{
			return Page.click(_event, _target);
		}

		static click(_event, _target = _event.target)
		{
			if(! _target.hasAttribute('href'))
			{
				if(_target.related && _target.related.hasAttribute('href'))
				{
					_target = _target.related;
				}
			}
			
			if(_target.hasAttribute('target'))
			{
				return _target;
			}

			const href = _target.href;
			const attr = _target.getAttribute('href');
			var url;

			if(typeof attr === 'string' && attr.length > 0)
			{
				url = attr;
			}
			else if(typeof href === 'string' && href.length > 0)
			{
				url = href;
			}
			else
			{
				return;
			}

			if(url.startsWith('javascript:'))
			{
				_event.preventDefault();
				return Page.executeJavaScript(url);
			}
			else if(url[0] === '~')
			{
				url = '#' + url;
			}

			if(DEFAULT_MENU_OUT_ITEMS)
			{
				setTimeout(() => {
					Menu.outItems(_event, null, _target);
				}, 0);
			}

			url = new URL(url, location.href);

			if(url.origin !== location.origin)
			{
				_target.setAttribute('target', _target.target = '_blank');
				return url.href;
			}
			else
			{
				_event.preventDefault();
			}

			if(url.hash.length > 2)
			{
				var a = url.pathname;
				var b = location.pathname;

				if(a[a.length - 1] === '/')
				{
					a = a.slice(0, -1);
				}

				if(b[b.length - 1] === '/')
				{
					b = b.slice(0, -1);
				}

				if(a === b)
				{
					url = url.hash;
				}
				else
				{
					url = url.href;
				}
			}
			else
			{
				url = url.href;
			}

			return Page.get(url);
		}
	}

	//
	Page.History = [];

	//
	Page.ID = {};

	//
	const on = {};

	on.hashchange = Page.onhashchange.bind(Page);
	on.click = Page.onclick.bind(Page);

	for(const idx in on)
	{
		window.addEventListener(idx, on[idx], {
			passive: false,
			capture: true
		});
	}

	//
	const getBase = () => {
		var result;

		try
		{
			result = new URL(path.dirname(location.base), location.href).base;
		}
		catch(_error)
		{
			result = new URL(location.href).base;
		}

		if(result[result.length - 1] !== '/')
		{
			result += '/';
		}

		return result;
	};

	//
	window.addEventListener('ready', () => {
		//
		Page.originalBase = getBase();

		//
		if(location.pathname[location.pathname.length - 1] !== '/')
		{
			return;
		}

		const url = location.toURL();

		if(location.hash.length > 1)
		{
			url.hash = location.hash;
			location.hash = '';
		}
		else if(document.getVariable('home', true))
		{
			url.hash = location.hash = '';
			const home = document.getVariable('home-page', true);
			
			if(isString(home, false))
			{
				if(home[0] === '#')
				{
					url.hash = home;
				}
				else if(home[0] === '~')
				{
					url.hash = '#' + home;
				}
				else
				{
					url.pathname = home;
				}
			}
		}

		if(url.href !== location.href)
		{
			location.href = url.href;
		}
	}, { once: true });

	//
	Page.originalBase = getBase();

	//
	
})();

