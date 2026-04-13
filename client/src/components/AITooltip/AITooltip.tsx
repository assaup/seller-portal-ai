import styles from './AITooltip.module.scss'


type Props = {
        loading: boolean
        error: string | null
        result: string | null
        onApply?: (value: string) => void
        onClose: () => void
    }

const AITooltip = (props: Props) => {
    const {
        loading,
        error,
        result,
        onApply,
        onClose,
    } = props

    if (!loading && !error && !result) return null

    return (
        <div className={styles.tooltip}>
            {loading && <p>Выполняется запрос...</p>}
            {error && (
                <>
                <p className={styles.error}>{error}</p>
                <button onClick={onClose}>Закрыть</button>
                </>
            )}
            {result && (
                <>
                <p className={styles.result}>{result}</p>
                <div className={styles.actions}>
                    {onApply && (
                        <button className={`${styles.btn} ${styles.btn_apply}`} onClick={() => onApply(result)}>Применить</button>
                    )}
                    <button className={styles.btn} onClick={onClose}>Закрыть</button>
                </div>
                </>
            )}
        </div>
    )

}

export default AITooltip