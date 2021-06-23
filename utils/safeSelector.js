const safeSelector = (selector,defaultValue) => {
	return (state) => {
		try {
			return selector(state);
		}catch(e){
			return defaultValue;
		}
	}
}
export default safeSelector