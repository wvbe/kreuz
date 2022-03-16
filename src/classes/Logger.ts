const enabled = false;

export default enabled
	? class LoggerEnabled {
			static log(...data: Parameters<typeof console.log>) {
				console.log(...data);
			}
			static warn(...data: Parameters<typeof console.warn>) {
				console.warn(...data);
			}
			static error(...data: Parameters<typeof console.error>) {
				console.error(...data);
			}
			static time(...data: Parameters<typeof console.time>) {
				console.time(...data);
			}
			static timeEnd(...data: Parameters<typeof console.timeEnd>) {
				console.timeEnd(...data);
			}
			static group(...data: Parameters<typeof console.group>) {
				console.group(...data);
			}
			static groupCollapsed(...data: Parameters<typeof console.groupCollapsed>) {
				console.groupCollapsed(...data);
			}

			static groupEnd(...data: Parameters<typeof console.groupEnd>) {
				console.groupEnd(...data);
			}
	  }
	: class LoggerDisabled {
			static log(...data: Parameters<typeof console.log>) {
				/* no-op */
			}
			static warn(...data: Parameters<typeof console.warn>) {
				/* no-op */
			}
			static error(...data: Parameters<typeof console.error>) {
				/* no-op */
			}
			static time(...data: Parameters<typeof console.time>) {
				/* no-op */
			}
			static timeEnd(...data: Parameters<typeof console.timeEnd>) {
				/* no-op */
			}
			static group(...data: Parameters<typeof console.group>) {
				/* no-op */
			}
			static groupCollapsed(...data: Parameters<typeof console.groupCollapsed>) {
				/* no-op */
			}
			static groupEnd(...data: Parameters<typeof console.groupEnd>) {
				/* no-op */
			}
	  };
