import Link from 'next/link'
import styles from '../styles/Header.module.css'
import { AIModel } from '../types/ai'
import { TopicSelector } from './TopicSelector'

interface HeaderProps {
  selectedModel: AIModel
  setSelectedModel: (model: AIModel) => void
  selectedTopics: string[]
  setSelectedTopics: (topics: string[]) => void
  onClearHistory: () => void
}

export function Header({ selectedModel, setSelectedModel, selectedTopics, setSelectedTopics, onClearHistory }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <Link href="/" className={styles.logo}>
          AI Chat
        </Link>
        <div className={styles.controls}>
          <select 
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value as AIModel)}
            className={styles.modelSelect}
          >
            <option value="gpt4">GPT-4 Turbo</option>
            <option value="gpt3">GPT-3.5 Turbo</option>
          </select>
          <button onClick={onClearHistory} className={styles.clearButton}>
            Clear History
          </button>
          <TopicSelector 
            selectedTopics={selectedTopics}
            onTopicChange={setSelectedTopics}
          />
        </div>
      </div>
    </header>
  )
}

