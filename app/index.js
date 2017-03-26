import 'react';
import 'purecss';
import './main.css';
import component from './component';
import { bake } from './shake';

bake();

//document.body.appendChild(component());
let demoComponent = component();

document.body.appendChild(demoComponent);

if (module.hot) {
	module.hot.accept('./component', () => {
		const nextComponent = component();
		// Replace old content with the hot loaded one
		document.body.replaceChild(nextComponent,demoComponent);
		demoComponent = nextComponent;
	});
}
