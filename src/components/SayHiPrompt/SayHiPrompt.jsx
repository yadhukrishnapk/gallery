import { useEffect, useState } from 'react'
import { markAsked, SAY_HI_AFTER_MS, THANKS_MS, useOnScreenFor, wasAsked } from './SayHiPrompt.logic'
import * as styles from './SayHiPrompt.styles'

// After a minute on the site, asks once for the visitor's name or Instagram @, so you know who stopped by.
// Only shows while their visit is being recorded (`enabled`), since otherwise there's nowhere to save it.
export function SayHiPrompt({ enabled, onSend }) {
  const due = useOnScreenFor(SAY_HI_AFTER_MS)
  const [step, setStep] = useState(() => (wasAsked() ? 'done' : 'asking')) // asking → thanks → done
  const [name, setName] = useState('')

  useEffect(() => {
    if (step !== 'thanks') return
    const id = setTimeout(() => setStep('done'), THANKS_MS)
    return () => clearTimeout(id)
  }, [step])

  if (step === 'done' || !enabled || !due) return null

  const send = (ev) => {
    ev.preventDefault()
    const answer = name.trim()
    if (!answer) return
    onSend(answer)
    markAsked('sent')
    setStep('thanks')
  }

  const skip = () => {
    markAsked('skipped')
    setStep('done')
  }

  return (
    <div className={styles.wrap}>
      <div role="dialog" aria-labelledby="say-hi-title" className={styles.card}>
        {step === 'thanks' ? (
          <p className={styles.thanks}>Thanks, {name.trim()}! 🙌</p>
        ) : (
          <form onSubmit={send}>
            <p id="say-hi-title" className={styles.title}>
              👋 Who&apos;s this?
            </p>
            <p className={styles.text}>Leave your name or Insta @ so I know you stopped by.</p>
            <input
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              placeholder="Name or @username"
              aria-label="Your name or Instagram username"
              maxLength={60}
              autoComplete="nickname"
              enterKeyHint="send"
              className={styles.input}
            />
            <div className={styles.actions}>
              <button type="button" onClick={skip} className={styles.skip}>
                Skip
              </button>
              <button type="submit" disabled={!name.trim()} className={styles.send}>
                Send
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
