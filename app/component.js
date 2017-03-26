export default function (text = 'Hello world') {
	const element = document.createElement('div');

	element.className = 'pure-button';
	element.innerHTML = text;
	element.onclick = () => {
		require.ensure([], (require) => {
			element.textContent = require('./lazy').default;
		});
	};

	return element;
}
