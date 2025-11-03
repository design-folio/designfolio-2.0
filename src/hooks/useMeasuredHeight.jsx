import * as React from "react";

export function useMeasuredHeight() {
    const ref = React.useRef(null)
    const [height, setHeight] = React.useState(undefined)

    React.useLayoutEffect(() => {
        if (!ref.current) return

        const measureHeight = () => {
            if (ref.current) {
                setHeight(ref.current.offsetHeight)
            }
        }

        measureHeight()

        const resizeObserver = new ResizeObserver(measureHeight)
        resizeObserver.observe(ref.current)

        return () => resizeObserver.disconnect()
    }, [])

    return [ref, height]
}