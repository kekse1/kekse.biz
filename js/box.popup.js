(function()
{

	//
	const DEFAULT_THROW = true;
	const DEFAULT_PARENT = HTML;
	const DEFAULT_SINGLE = true;
	const DEFAULT_ESCAPE_FORCE_DESTROY = true;
		
	//
	Popup = Box.Popup = class Popup extends Box
	{
		constructor(... _args)
		{
			//
			super(... _args);

			//
			this.identifyAs('popup');

			//
			this.style.setProperty('opacity', '0');
		}

		static create(_event, _target = _event.target, _callback = null, _throw = DEFAULT_THROW)
		{
			//
			if(typeof _target.dataset.popup !== 'string')
			{
				if(_target.isPopup)
				{
					_target = _target.related;
				}
				else if(_throw)
				{
					throw new Error('Your .dataset.popup is not a String, so we can\'t create a new Popup');
				}
				
				return null;
			}
			
			if(_target.dataset.popup.length === 0)
			{
				if(_throw)
				{
					throw new Error('Your .dataset.popup string is empty.. this means, we stop finding other popup in Popup.find(); ...');
				}
				
				return null;
			}
			else if(! _target.isVisible)
			{
				if(_throw)
				{
					throw new Error('Your _target is !.isVisible');
				}
				
				return null;
			}

			//
			const result = new Popup({
				left: _event.clientX,
				top: _event.clientY
			});

			//
			Box._INDEX.pushUnique(result);

			//
			result.innerHTML = _target.dataset.popup;
			
			//
			result.isPopup = true;
			result.hasPopup = null;
			result.related = _target;
			_target.related = result;
			_target.isPopup = false;
			_target.hasPopup = true;
			_target.popup = result;

			//
			DEFAULT_PARENT.appendChild(result, null, () => {
				result.open(_event, _callback);
			});

			//
			return result;
		}
		
		disconnectedCallback()
		{
			if(Popup.INDEX.length <= 1)
			{
				Popup.pause = false;
			}
			
			return super.disconnectedCallback();
		}
	
		open(_event, _callback)
		{
			if(this.pause || Popup.pause)
			{
				return;
			}
			else if(_event)
			{
				this.move(_event, null, false);
			}

			if(this.forceDestroy)
			{
				return null;
			}
			else if(this.isOpen)
			{
				return null;
			}
			else if(this.IN)
			{
				return this.IN;
			}
			else if(this.OUT)
			{
				return this.OUT.stop(() => {
					return this.open(_event, _callback);
				});
			}
			else
			{
				this.isClosed = false;
			}

			if(this.forceDestroy)
			{
				if(this.OUT)
				{
					return this.OUT.stop(() => {
						return this.close(_event, _callback);
					});
				}

				return this.close(_event, _callback, true);
			}

			return this.in({
				duration: this.getVariable('duration', true), delay: 0
			}, (_e, _f) => {
				this.isOpen = _f;
				call(_callback, { type: 'open', event: _e, finish: _f }, _f);
			});
		}
		
		close(_event, _callback, _force_destroy = false)
		{
			//
			if(this.pause || Popup.pause)
			{
				if(! _force_destroy)
				{
					return false;
				}
			}
			
			if(_event)
			{
				this.move(_event, null, false);
			}
			
			//
			if(this.isClosed)
			{
				return null;
			}
			else
			{
				this.forceDestroy = !!_force_destroy;
			}

			if(this.OUT)
			{
				return this.OUT;
			}
			else if(this.IN)
			{
				return this.IN.stop(() => {
					return this.close(_event, _callback, _force_destroy);
				});
			}
			else
			{
				this.isOpen = false;
			}

			//
			const callback = (_e, _f) => {
				call(_callback, { type: (_f ? 'destroy' : 'close'), event: _e, finish: _f }, _f);
			};

			return this.out({
				duration: this.getVariable('duration', true), delay: 0
			}, (_e, _f) => {
				this.isClosed = _f;

				if(_f || this.forceDestroy)
				{
					this.destroy(_event, callback);
				}
				else
				{
					call(callback, _e, _f);
				}
			});
		}

		move(_event_x, _y, _throw = DEFAULT_THROW)
		{
			//
			if(this.pause || Popup.pause)
			{
				return;
			}
			else if(typeof _y === 'boolean')
			{
				_throw = _y;
				_y = null;
			}
			
			//
			var x, y;
			
			if(isNumber(_event_x) && isNumber(_y))
			{
				x = _event_x;
				y = _y;
			}
			else if(isObject(_event_x) && isNumber(_event_x.clientX) && isNumber(_event_x.clientY))
			{
				x = _event_x.clientX;
				y = _event_x.clientY;
			}
			else if(_throw)
			{
				throw new Error('Invalid or missing argument(s)');
			}
			else
			{
				return null;
			}
			
			//
			this.x = x;
			this.y = y;

			//
			return [ x, y ]
		}
		
		destroy(_event, _callback, ... _args)
		{
			return super.destroy(null, () => {
				//
				Box._INDEX.remove(this);

				//
				if(this.related)
				{
					delete this.related.popup;
					delete this.related.related;
					delete this.related.isPopup;
					delete this.related.hasPopup;
					delete this.related;
				}
			
				//
				call(_callback, { type: 'destroy', this: this }, true);
			});
		}
		
		//
		//TODO/for animations..
		//
		measureData(_event)
		{
			//
throw new Error('TODO');
		}
		
		get x()
		{
			return getValue(getComputedStyle(this).left, 'px');
		}
		
		set x(_value)
		{
			if(! isNumber(_value) && typeof _value !== 'string')
			{
				return null;
			}
			else if(typeof _value === 'number')
			{
				const pos = this.getPosition(_value, this.y, this.offsetWidth, this.offsetHeight, this.getVariable('arrange', true), true);
				_value = pos[0];
			}
			
			this.style.right = 'auto';
			_value = this.style.left = setValue(_value, 'px', true);
			return _value;
		}
		
		get y()
		{
			return getValue(getComputedStyle(this).top, 'px');
		}
		
		set y(_value)
		{
			if(! isNumber(_value) && typeof _value !== 'string')
			{
				return null;
			}
			else if(typeof _value === 'number')
			{
				const pos = this.getPosition(this.x, _value, this.offsetWidth, this.offsetHeight, this.getVariable('arrange', true), true);
				_value = pos[1];
			}
			
			this.style.bottom = 'auto';
			_value = this.style.top = setValue(_value, 'px', true);
			return _value;
		}

		static lookup(_event_x, _y, _throw = DEFAULT_THROW)
		{
			var x, y;
			
			if(isNumber(_event_x) && isNumber(_y))
			{
				x = _event_x;
				y = _y;
			}
			else if(isObject(_event_x) && isNumber(_event_x.clientX) && isNumber(_event_x.clientY))
			{
				x = _event_x.clientX;
				y = _event_x.clientY;
			}
			else if(_throw)
			{
				throw new Error('Invalid or missing argument(s)');
			}
			else
			{
				return null;
			}
			
			const result = [];
			const elements = document.elementsFromPoint(x, y);

			for(var i = 0, j = 0; i < elements.length; ++i)
			{
				if(! elements[i].isVisible)
				{
					continue;
				}
				else if(typeof elements[i].dataset.popup === 'string')
				{
					if(elements[i].isPopup || elements[i].hasPopup)
					{
						continue;
					}
					else if(elements[i].dataset.popup.length > 0)
					{
						result[j++] = elements[i];
					}
					else
					{
						break;
					}
				}
			}

			return result;
		}
		
		static test(_event_x, _y, _popup, _throw = DEFAULT_THROW)
		{
			if(! _popup)
			{
				if(_throw)
				{
					throw new Error('No _popup defined');
				}
				
				return null;
			}
			
			var x, y;
			
			if(isNumber(_event_x) && isNumber(_y))
			{
				x = _event_x;
				y = _y;
			}
			else if(isObject(_event_x) && isNumber(_event_x.clientX) && isNumber(_event_x.clientY))
			{
				x = _event_x.clientX;
				y = _event_x.clientY;
			}
			else if(_throw)
			{
				throw new Error('Invalid or missing argument(s)');
			}
			else
			{
				return null;
			}

			var result;
			const r = _popup.related;
			const b = r.getBoundingClientRect();
			
			if(!r)
			{
				result = false;
			}
			else if(! r.isVisible)
			{
				result = false;
			}
			else if(typeof r.dataset.popup !== 'string' || r.dataset.popup.length === 0)
			{
				result = false;
			}
			else if(x < b.left)
			{
				result = false;
			}
			else if(y < b.top)
			{
				result = false;
			}
			else if(x > b.right)
			{
				result = false;
			}
			else if(y > b.bottom)
			{
				result = false;
			}
			else
			{
				result = true;
			}
			
			return result;
		}
		
		test(_event_x, _y, _throw = DEFAULT_THROW)
		{
			return Popup.test(_event_x, _y, this, _throw);
		}
		
		static clear(_event, _force_destroy = false, _callback = null, ... _excludes)
		{
			const index = Popup.INDEX;
			
			if(index.length === 0)
			{
				return 0;
			}

			if(is(_callback, 'Popup'))
			{
				_excludes.unshift(_callback);
				_callback = null;
			}
			else if(typeof _callback !== 'function')
			{
				_callback = null;
			}
			
			if(is(_force_destroy, 'Popup'))
			{
				_excludes.unshift(_force_destroy);
				_force_destroy = false;
			}
			else if(typeof _force_destroy !== 'boolean')
			{
				_force_destroy = false;
			}

			if(is(_event, 'Popup'))
			{
				_excludes.unshift(_event);
				_event = null;
			}
			else if(! _event)
			{
				_event = null;
			}

			var result = 0;
			var count = 0;
			var fin = 0;
			
			const callback = (_e, _f) => {
				if(_f)
				{
					++fin;
				}
				
				if(++count >= result)
				{ 
					if(fin >= result)
					{
						fin = true;
					}
					else
					{
						fin = (fin / result);
					}

					call(_callback, { type: 'clear', event: _e, finish: fin, count: result }, fin);
				}
			};

			if(Popup.pause && !_force_destroy)
			{
				callback(null, true);
				return 0;
			}
			
			for(var i = 0; i < index.length; ++i)
			{
				if(! _excludes.includes(index[i]))
				{
					if(index[i].forceDestroy)
					{
						if(! index[i].OUT)
						{
							index[i].close(_event, callback, true);
						}
					}
					else if(_force_destroy || !index[i].pause)
					{
						++result;
						index[i].close(_event, callback, _force_destroy);
					}
				}
			}
			
			if(result === 0)
			{
				call(_callback, { type: 'clear', count: 0, event: null, finish: true }, true);
			}
			
			return result;
		}

		static onpointerdown(_event, _callback)
		{
			if(Popup.pause)
			{
				return;
			}
			else if(Popup.clear(_event, false, _callback) > 0)
			{
				//
			}
		}

		static onpointerup(_event, _callback)
		{
			//
			if(Popup.pause)
			{
				return;
			}
			
			var result = 0;
			var count = 0;

			const cb = () => {
				if(++count >= result)
				{
					call(_callback, { type: 'pointerup', result, event: _event }, _event);
				}
			};

			const index = Popup.INDEX;

			for(var i = 0; i < index.length; ++i)
			{
				if(! index[i].pause)
				{
					++result;

					if(index[i].open(_event, cb))
					{
						//
					}
				}
			}

			if(result === 0)
			{
				cb();
			}

			return result;
		}
		
		static onpointermove(_event)
		{
			//
			if(Popup.pause)
			{
				return;
			}
			
			//
			const elements = Popup.lookup(_event);
			const index = [ ... Popup.INDEX ];
			
			for(var i = index.length - 1; i >= 0; --i)
			{
				if(! index[i].test(_event))
				{
					if(index.splice(i, 1)[0].close(_event))
					{
						//
					}
				}
				else
				{
					if(index[i].open(_event))
					{
						//
					}
					
					if(DEFAULT_SINGLE)
					{
						elements.length = 0;
						break;
					}
				}
			}
			
			if(elements.length > 0)
			{
				for(var i = 0; i < elements.length; ++i)
				{
					if(Popup.create(_event, elements[i]))
					{
						//
						
						if(DEFAULT_SINGLE)
						{
							index.length = 0;
							break;
						}
					}
				}
			}
		}

		static onkeydown(_event)
		{
			switch(_event.key)
			{
				case 'Control':
					Popup.pause = true;
					_event.preventDefault();
					break;
				case 'Escape':
					if(Popup.clear(_event, DEFAULT_ESCAPE_FORCE_DESTROY) > 0)
					{
						_event.preventDefault();
					}
					break;
			}
		}

		static onkeyup(_event)
		{
			switch(_event.key)
			{
				case 'Control':
					Popup.pause = false;
					break;
			}
		}

		blink(_options)
		{
			if(! isObject(_options))
			{
				_options = {};
			}

			if(! (isInt(_options.count) && _options.count > 0))
			{
				_options.count = 2;
			}

			if(typeof _options.border !== 'boolean')
			{
				_options.border = false;
			}

			if(this.BLINK)
			{
				return this.BLINK;
			}
			else if(this._blinkCallback)
			{
				return this._blinkCallback;
			}
			else if(this.IN)
			{
				this._blinkCallback = () => {
					delete this._blinkCallback;

					if(this.isOpen)
					{
						return super.blink(_options);
					}
				};

				if(! isArray(this._inCallbacks, true))
				{
					this._inCallbacks = [ this._blinkCallback ];
				}
				else
				{
					this._inCallbacks.push(this._blinkCallback);
				}

				return this.IN;
			}
			else if(this.OUT)
			{
				return this.OUT;
			}

			return super.blink(_options);
		}
		
		static get hasPopup()
		{
			const index = Popup.INDEX;
			
			if(index.length === 0)
			{
				return false;
			}
			
			var outings = true;
			
			for(const p of index)
			{
				if(! (p.OUT || p.isClosed))
				{
					outings = false;
					break;
				}
			}
			
			return !outings;
		}
		
		static blink(_options)
		{
			const index = Popup.INDEX;
			
			for(const p of index)
			{
				p.blink(_options);
			}
			
			return index.length;
		}

		static get pause()
		{
			return Popup.paused;
		}
		
		static set pause(_value)
		{
			if(! Popup.hasPopup)
			{
				Popup.paused = false;
				return null;
			}
			else if(Popup.paused === (_value = !!_value))
			{
				return false;
			}
			else if(_value)
			{
				osd(pauseON);
			}
			else
			{
				osd(pauseOFF);
			}
			
			Popup.blink();
			return Popup.paused = _value;
		}

		get pause()
		{
			return this.hasAttribute('pause');
		}

		set pause(_value)
		{
			if(this.OUT || this.isClosed)
			{
				return null;
			}
			else if(this.pause === (_value = !!_value))
			{
				return false;
			}
			else if(_value = !!_value)
			{
				this.setAttribute('pause', '');
			}
			else
			{
				this.removeAttribute('pause');
			}

			this.blink();
			return _value;
		}
	}
	
	//
	const pauseON = '<span style="font-size: 0.7em; color: green;">ON</span><span style="font-size: 0.4em; color: blue;">freeze</span>';
	const pauseOFF = '<span style="font-size: 0.7em; color: red;">OFF</span><span style="font-size: 0.4em; color: blue;">freeze</span>';
	
	//
	Popup.paused = false;
	
	//
	if(! customElements.get('a-popup'))
	{
		customElements.define('a-popup', Popup, { is: 'a-box' });
	}
	
	//
	Object.defineProperty(Popup, 'INDEX', { get: function()
	{
		const result = [];
		
		for(var i = 0, j = 0; i < Box._INDEX.length; ++i)
		{
			if(is(Box._INDEX[i], 'Popup'))
			{
				result[j++] = Box._INDEX[i];
			}
		}
		
		return result;
	}});
	
	//
	const on = {};

	on.pointermove = Popup.onpointermove.bind(Popup);
	on.pointerdown = Popup.onpointerdown.bind(Popup);
	on.pointerup = Popup.onpointerup.bind(Popup);
	on.keydown = Popup.onkeydown.bind(Popup);
	on.keyup = Popup.onkeyup.bind(Popup);

	var passive;
	for(const idx in on)
	{
		switch(idx)
		{
			case 'keydown':
				passive = false;
				break;
			default:
				passive = true;
				break;
		}

		window.addEventListener(idx, on[idx], { passive, capture: true });
	}

	//
	
})();
