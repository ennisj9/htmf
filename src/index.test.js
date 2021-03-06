import { process, toString } from './index';

describe('process()', () => {

	it('accepts a single node', () => {
		let res = process($ => { $
			.a('div')
		});
		expect(res).toMatchObject([
			{
				element: 'div',
				children: [],
				classes: [],
				attributes: {}
			}
		]);
	})

	it('handles two roots', () => {
		let res = process($ => { $
			.a('div')
			.a('div')
				.b('more')
		});
		expect(res).toHaveLength(2);
	})

	it('treats all texts the same', () => {
		let simple = process($ => { $
			.a('div').text('something')
		});
		let empty = process($ => { $
			.a('div')
				.b().text('something')
		});
		let construct = process($ => { $
			.a('div')
				.b(String, 'something')
		});
		expect(empty).toMatchObject(simple)
		expect(construct).toMatchObject(simple)
	})

	it('can create a single node with [] and text', () => {
		let res = process(['div .blah'], 'some text here');
		expect(res).toMatchObject([
			{
				element: 'div',
				children: [{
					element: null,
					classes: [],
					text: 'some text here',
					attributes: {},
					children: []
				}],
				classes: ['blah'],
				attributes: {}
			}
		])
	})

	it('can handle just a text node', () => {
		let res = process($ => { $
			.a(String, 'some text')
		})
		let shouldBe = [
			{
				element: null,
				children: [],
				classes: [],
				attributes: {},
				text: 'some text'
			}
		];
		expect(res).toMatchObject(shouldBe)
		expect(process([],'some text')).toMatchObject(shouldBe);
	})
  
  it('treats the first argument as possible element', () => {
    let res = process($ => { $
			.a({dont: 'touchthis'}, '.class', {attr: 'val'})
		})
    let shouldBe = [
      {
        element: {dont: 'touchthis'},
        children: [],
        classes: ['class'],
        attributes: {attr: 'val'}
      }
    ]
  })
  
});

describe('toString()', () => {
	
	it('can handle elements and text', () => {
		expect(toString($ => { $
			.a('div')
				.b('p').text('something')
		})).toEqual('<div><p>something</p></div>')
	})

	it('can handle a single class', () => {
		expect(toString($ => { $
			.a('div .blah')
		})).toEqual('<div class="blah"></div>')
	})

	it('can handle multiple classes', () => {
		expect(toString($ => { $
			.a('div .blah', '.more .last')
		})).toEqual('<div class="blah more last"></div>')
	})

	it('can handle attributes and ids', () => {
		expect(toString($ => { $
			.a('div #blah', {key: 'value'})
				.b('span .inner', {a: 'b'})
		})).toEqual('<div id="blah" key="value"><span class="inner" a="b"></span></div>')
	})

	it('can start with c and skip levels', ()=> {
		expect(toString($ => { $
			.c('div')
				.f('span')
					.j('div .inner').text('foobar')
				.d('p').text('other')
		})).toEqual('<div><span><div class="inner">foobar</div></span><p>other</p></div>')
	})

	it('can handle component elements and text', () => {
		let comp = params => {
			return $ => { $
				.a('div')
					.b('p').text('something')
			}
		}
		expect(toString(comp())).toEqual('<div><p>something</p></div>')
	})

	it('can handle nested components', () => {
		let compA = params => {
			return $ => { $
				.a('div')
					.b('p').text(params.foo)
			}
		}

		let compB = params => {
			return $ => { $
				.a('div')
					.b('span').text('first')
					.b(compA, {foo: 'bar'})
					.b('p').test('end')
			}
		}

		expect(toString(compB())).toEqual('<div><span>first</span><div><p>bar</p></div><p>end</p></div>')
	})

});