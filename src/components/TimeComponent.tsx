
export default function TimeComponent() {
    return (
        <div className="text-right">
            <div className="text-sm text-gray-400 font-mono">Current Time</div>
            <div className="text-lg font-semibold text-blue-400">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
        </div>
    )
}
