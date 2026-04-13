import { useNavigate, useParams } from "react-router-dom"
import { useFetch } from "../../hooks/useFetch"
import type { Item } from "../../types"
import { itemsApi } from "../../api/items"
import styles from './AdViewPage.module.scss'


const AdViewPage = () => {

  const { id } =  useParams()

  const { data, error, loading } = useFetch<Item>(
    (signal) => itemsApi.getById(id!, signal), [id]
  )
  const navigate = useNavigate()
  const handleEdit = () => {
    navigate(`/ads/${id}/edit`)
  }
  const handleListAds = () => {
    navigate(`/ads`)
  }

  if (loading) return <p>Загрузка...</p>
  if (error) return <p>Ошибка: {error}</p>
  if (!data) return null

  const formatted =  new Date(data.createdAt).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  
  const paramsToRu: Record<string, string> = {
    brand: 'Бренд',
    type: 'Тип',
    model: 'Модель',
    color: 'Цвет',
    condition: 'Состояние',
    yearOfManufacture: 'Год выпуска',
    transmission: 'Коробка передач',
    mileage: 'Пробег, км',
    enginePower: 'Мощность двигателя, л.с',
    address: 'Адрес',
    area: 'Площадь, м²',
    floor: 'Этаж',
  }

  const emptyFields:string[] = []
  if (!data.description) emptyFields.push('Описание')

  const params = data.params as Record<string, unknown>
  const allParamKeys: Record<string, string[]> = {
    electronics: ['type', 'brand', 'model', 'condition', 'color'],
    auto: ['brand', 'model', 'yearOfManufacture', 'transmission', 'mileage', 'enginePower'],
    real_estate: ['type', 'address', 'area', 'floor'],
  }

  allParamKeys[data.category].forEach((key) => {
    if (!params[key]) emptyFields.push(paramsToRu[key] ?? [key])
  })


  return (
    <div className={styles.layout}>
      <section className={styles.section}>
          <div className={styles.info}>
            <div>
              <h1 className={styles.title}>{data.title}</h1>
              <div className={styles.btns}>
                <button 
                  className={styles.btn} 
                  onClick={handleEdit}
                >
                  Редактировать
                </button>
                <button 
                  className={`${styles.btn} ${styles.btn_back}`}
                  onClick={handleListAds}
                >
                  К списку
                </button>
              </div>
            </div>
            <div className={styles.info__rightWrapper}>
              <strong className={styles.price}>{data.price.toLocaleString('ru-RU')} ₽</strong>
              <p className={styles.date}>Опубликовано: {formatted}</p>
            </div>
          </div>
          <span className={styles.line}></span>
        </section>
        <section className={styles.content}>
          <div className={styles.leftWrapper}>
            <img 
              src={`https://placehold.co/300x200?text=${encodeURIComponent(data.title)}`} 
              alt={data.title}
              className={styles.img}
            />
            <h2 className={styles.titleSecond}>Описание</h2>
            <p className="desc">{data.description}</p>
          </div>
          <div>
            {emptyFields.length > 0 && (
              <div className={styles.needsRevision}>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 16 16" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className={styles.needsRevision__svg}
              >
                <path 
                  d="M7.875 0C3.52617 0 0 3.52617 0 7.875C0 12.2238 3.52617 15.75 7.875 15.75C12.2238 15.75 15.75 12.2238 15.75 7.875C15.75 3.52617 12.2238 0 7.875 0ZM7.3125 4.07812C7.3125 4.00078 7.37578 3.9375 7.45312 3.9375H8.29688C8.37422 3.9375 8.4375 4.00078 8.4375 4.07812V8.85938C8.4375 8.93672 8.37422 9 8.29688 9H7.45312C7.37578 9 7.3125 8.93672 7.3125 8.85938V4.07812ZM7.875 11.8125C7.65421 11.808 7.44398 11.7171 7.28942 11.5594C7.13486 11.4016 7.0483 11.1896 7.0483 10.9688C7.0483 10.7479 7.13486 10.5359 7.28942 10.3781C7.44398 10.2204 7.65421 10.1295 7.875 10.125C8.09579 10.1295 8.30603 10.2204 8.46058 10.3781C8.61514 10.5359 8.7017 10.7479 8.7017 10.9688C8.7017 11.1896 8.61514 11.4016 8.46058 11.5594C8.30603 11.7171 8.09579 11.808 7.875 11.8125Z" 
                  fill="#FFA940"
                />
              </svg>

              <strong className={styles.needsRevision__title}>Требуются доработки</strong>
              <p>У объявления не заполнены поля:</p>
              <ul className={styles.needsRevision__list}>
                {emptyFields.map((field) => 
                  <li key={field}>{field}</li>
                )}
              </ul>
            </div>
            )}
            <div>
              <h2 className={styles.titleSecond}>Характеристики</h2>
              <table>
                <tbody>
                  {Object.entries(data.params).map(([key, val]) =>
                    <tr key={key}>
                      <td className={styles.key}>{paramsToRu[key]}</td>
                      <td >{val}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
    </div>
  )
}

export default AdViewPage