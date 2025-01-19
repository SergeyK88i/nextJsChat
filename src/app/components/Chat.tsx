'use client'

import { useState, useEffect, useRef } from 'react'
import styles from '../styles/Chat.module.css'
import { type AIModel } from '../types/ai'
import { Header } from './Header'
import { SidePanel } from './Sidepanel'
import { clearChatHistory, sendChatRequest } from '../utils/api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function Chat() {
  const messageEndRef = useRef<HTMLDivElement>(null)
  const [selectedModel, setSelectedModel] = useState<AIModel>('gpt3')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [sidePanelContent, setSidePanelContent] = useState<string>('')
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content) {
      if (lastMessage.content.includes('```')) {
        setSidePanelContent(lastMessage.content)
        setIsSidePanelOpen(true)
      } else {
        setIsSidePanelOpen(false)
      }
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input }
    
    const updatedMessages = [...messages, userMessage]
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const data = await sendChatRequest(updatedMessages, selectedModel, selectedTopics)
      if (data && data.answer) {
        const assistantMessage: Message = { 
          id: Date.now().toString(), 
          role: 'assistant', 
          content: data.answer
        }
        setMessages(messages => [...messages, assistantMessage])
      }
    } catch (error) {
      console.error('Error:', error)
      // Обработка ошибки
    } finally {
      setIsLoading(false)
    }
  }

  const closeSidePanel = () => {
    setIsSidePanelOpen(false)
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleClearHistory = async () => {
    try {
      await clearChatHistory()
      setMessages([])
      setSidePanelContent('')
      setIsSidePanelOpen(false)
    } catch (error) {
      console.error('Error clearing history:', error)
    }
  }

  return (
    <div className={styles.container}>
      <Header 
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        selectedTopics={selectedTopics}
        setSelectedTopics={setSelectedTopics}
        onClearHistory={handleClearHistory}
      />
      <main className={styles.main}>
        <div className={`${styles.card} ${isSidePanelOpen ? styles.cardWithSidePanel : ''}`}>
          <div className={styles.chatContainer}>
            <div className={styles.messageArea}>
              {messages.map((message) => (
                message && message.content && (
                  <div
                    key={message.id}
                    className={`${styles.message} ${
                      message.role === 'user' ? styles.userMessage : styles.assistantMessage
                    }`}
                  >
                    <div
                      className={`${styles.messageContent} ${
                        message.role === 'user' ? styles.userMessageContent : styles.assistantMessageContent
                      }`}
                      onClick={() => {
                        if (message.content.includes('```')) {
                          setSidePanelContent(message.content)
                          setIsSidePanelOpen(true)
                        }
                      }}
                      style={{ cursor: message.content.includes('```') ? 'pointer' : 'default' }}
                    >
                      {message.content.includes('```') 
                        ? 'Показать пример кода'
                        : message.content}
                    </div>
                  </div>
                )
              ))}
              <div ref={messageEndRef} />
            </div>
            <form
              onSubmit={handleSubmit}
              className={styles.inputArea}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className={styles.input}
                disabled={isLoading}
              />
              <button type="submit" className={styles.sendButton} disabled={isLoading}>
                Send
              </button>
            </form>
          </div>
        </div>
        <SidePanel 
          content={sidePanelContent} 
          isOpen={isSidePanelOpen} 
          onClose={closeSidePanel} 
        />
      </main>
    </div>
  )
}

