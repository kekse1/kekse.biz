(function()
{

	//
	const DEFAULT_THROW = true;

	//
	html = { entities: String.entities };

	//
	html.extract = (_data, _tag, _depth, _throw = DEFAULT_THROW) => {
		if(typeof _data !== 'string')
		{
			if(_throw)
			{
				throw new Error('Invalid _data argument (not a String)');
			}

			return null;
		}
		else if(isString(_tag, false))
		{
			_tag = [ _tag.toLowerCase() ];
		}
		else if(isArray(_tag, false))
		{
			for(var i = 0; i < _tag.length; ++i)
			{
				if(isString(_tag[i], false))
				{
					_tag[i] = _tag[i].toLowerCase();
				}
				else if(_throw)
				{
					throw new Error('Invalid _tag[' + i + '] (no non-empty String)');
				}
				else
				{
					_tag.splice(i--, 1);
				}
			}

			if(_tag.length === 0)
			{
				_tag = null;
			}
		}
		else
		{
			_tag = null;
		}

		//
_depth = 1;
		if(! (isInt(_depth) && _depth >= 0))
		{
			_depth = 1;
		}
		else if(_depth === 0)
		{
			return [ _data ];
		}

		//
		var result = [];
		const data = [''];
		var open = 0;
		var c, tag;

		//
		for(var i = 0, j = 0; i < _data.length; ++i)
		{
			if(_data[i] === '\\')
			{
				if(i < (_data.length - 1))
				{
					c = _data[++i];
				}
				else
				{
					c = '\\';
				}

				data[open] += c;
			}
			else if(open > 0)
			{
				if(_data.at(i, '</' + tag + '>', false))
				{
					data[open] += _data.substr(i, 3 + tag.length);
					result[j++] = data.splice(open--, 1)[0];
					i += 2 + tag.length;
				}
				else if(_data.at(i, '/>'))
				{
					data[open] += '/>';
					result[j++] = data.splice(open--, 1)[0];
					++i;
				}
				else
				{
					data[open] += _data[i];
				}
			}
			else if(_data[i] === '<')
			{
				tag = '';
				
				if(_tag) for(var k = 0; k < _tag.length; ++k)
				{
					if(_data.at(i + 1, _tag[k], false))
					{
						tag = _tag[k];
						break;
					}
				}
				else
				{
					for(var k = i + 1; k < _data.length; ++k)
					{
						if(_data[k].isEmpty)
						{
							break;
						}
						else if(_data[k] === '>')
						{
							break;
						}
						else
						{
							tag += _data[k];
						}
					}
				}

				if(tag.length === 0)
				{
					data[open = 0] += '<';
				}
				else
				{
					if(data.length <= (open = 1))
					{
						data[open] = '';
					}
					
					data[open] += '<' + tag;
					i += tag.length;
				}
			}
			else
			{
				data[open = 0] += _data[i];
			}
		}

		//
		if(open > 0)
		{
			if(_throw && document.getVariable('data-error', true))
			{
				throw new Error('Invalid _data (malformed HTML: opening bracket \'<\' has not been closed)');
			}
			
			result = [ _data ];
		}
		else if(data.length > 0) for(var i = 0; i < data.length; ++i)
		{
			result.unshift(data[i]);
		}

//alert(Object.debug(result));
//
//TODO/inner parsing to objects w/ attribs, etc..
//and use result[0] as rest-data...!
//

		/*
		for(var i = 1; i < result.length; ++i)
		{
			//
		}*/

		//
		return result;
	};

	//
	html.extract.script = (_data, _depth = 1, _throw = DEFAULT_THROW) => {
		return html.extract(_data, 'script', _depth, _throw);
	};
	
	html.extract.style = (_data, _depth = 1, _throw = DEFAULT_THROW) => {
		return html.extract(_data, ['style','link'], _depth, _throw);
	};
	
	//

})();
	
