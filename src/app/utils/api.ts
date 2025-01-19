import { Message } from '../types/ai'

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const API_URL = 'http://kandaurov:8000/api/v1'

export async function sendChatRequest(messages: Message[], model: string, selectedTopics: string[]) {
  console.log('API_URL:', API_URL)
  
  // Получаем последнее сообщение для текущего вопроса
  const lastMessage = messages[messages.length - 1]
  if (!lastMessage || !lastMessage.content) {
    throw new Error('No message content provided')
  }
  
  console.log('Request payload:', {
    text: lastMessage.content,
    history: messages.slice(0, -1).map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    model,
    selectedTopics
  })
  try {
    const response = await fetch(`${API_URL}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        text: lastMessage.content,
        history: messages.slice(0, -1).map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        model,
        selectedTopics
      }),
    })
  
    if (!response.ok) {
      console.error('Server response status:', response.status)
      console.error('Server response status text:', response.statusText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    try {
      const data = await response.json()
      console.log('Server response:', data)
      return data
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      throw new Error('Failed to parse server response')
    }
  } catch (networkError) {
    console.error('Network error:', networkError)
    throw new Error('Network request failed')
  }

  
}

