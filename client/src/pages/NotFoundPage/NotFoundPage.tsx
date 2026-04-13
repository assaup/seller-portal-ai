import { Link } from 'react-router-dom'
import styles from './NotFoundPage.module.scss'

const NotFoundPage = () => {
  return (
    <div className={styles.layout}>
      <h1 className={styles.code}>404</h1>
      <p className={styles.message}>Страница не найдена</p>
      <Link to="/ads" className={styles.link}>Вернуться к объявлениям</Link>
    </div>
  )
}

export default NotFoundPage