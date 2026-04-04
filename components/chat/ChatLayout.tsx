'use client'

interface ChatLayoutProps {
  messageArea: React.ReactNode
  inputBar: React.ReactNode
}

export function ChatLayout({ messageArea, inputBar }: ChatLayoutProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Scrollable message area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth px-4 md:px-8">
        {messageArea}
      </div>
      {/* Sticky input bar */}
      <div className="sticky bottom-0 bg-white">
        {inputBar}
      </div>
    </div>
  )
}
