const alphabet = ('abcdefghijklmnopqrstuvwxyz').split('');

const argumentsToArray = args => {
  let done = [];
  args.map(arg => {
    if(typeof arg === 'string') {
      arg.split(' ').map(inner => {
        done.push(inner);
      });
    } else done.push(arg);
  });
  return done;
}
const clip = str => str.substr(1, str.length-1)

const createNode = (...args) => (
	Object.assign({
		element: null,
		classes: [],
		attributes: {},
		children: []
	}, ...args)
)

const process = (func, apidef, ...furtherArgs) => {
	
	if(Array.isArray(func)){
		return process($ => {
			$.a.apply($,func)
			if(apidef && typeof apidef == 'string') $.text(apidef);
		});
	}
	
	const builder = {};
  const stack = [];
	const roots = [];
	const current = () => stack[stack.length-1].node;

	const api = Object.assign({
		text: (node, str) => {
			str = String(str);
			if(current().element == null) node.text = str;
			else node.children.push(createNode({text: str}));
		}
	}, apidef);

	Object.keys(api).map(method => {
		builder[method] = (...args) => {
			api[method](current(), ...args);
			return builder;
		}
	})
	alphabet.map((letter, level) => {
    builder[letter] = (...args) => {
			const node = createNode();
			if(args[0] === String) {
				node.text = String(args[1]);
			}
			else argumentsToArray(args).map((arg,i) => {
				if(typeof arg == 'string') {
					let fc = arg.charAt(0);
					if(fc === '#') node.attributes.id = clip(arg);
					else if(fc === '.') node.classes.push(clip(arg))
					else node.element = arg;
				} else if(typeof arg == 'object' && i != 0) {
          Object.assign(node.attributes, arg);
				} else {
					node.element = arg;
				}
			});	
			while(stack.length > 0 && stack[stack.length-1].level >= level) stack.pop();
			let parent;
			if(stack.length > 0) parent = stack[stack.length-1].node;
			if(parent) {
				parent.children.push(node);
			} else {
				roots.push(node);
			}
			stack.push({level: level, node: node});
			return builder;
		}
	});
	func(builder, ...furtherArgs);
	return roots;
}


const toString = (func, tab) => {
	const convert = node => {
		let prefix = ''
		let suffix = '';
		if(node.element){
			prefix = '<'+node.element;
			suffix = '</'+node.element +'>';
			if(node.classes.length > 0){
				prefix += node.classes.reduce((str, cl, i) => {
					return str + (i==0?'':' ') + cl;
				}, ' class="') + '"';
			}
			Object.keys(node.attributes).map(key => {
				prefix += ' '+key + '="' + node.attributes[key] + '"';
			})
			prefix += '>';
		}
		if(node.text) prefix += node.text;
		const children = node.children.reduce((sofar, child) => {
			return sofar + convert(child);
		},'');
		return  prefix + children + suffix;
	
	}
	return process(func).map(convert).join();
}
const Mf = { process, toString };

export { Mf as default, process, toString };
	


