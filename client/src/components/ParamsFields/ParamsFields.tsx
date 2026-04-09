import type { AutoParams, Category, ElectronicsParams, RealEstateParams } from "../../types"
import styles from './ParamsFields.module.scss'
type Props = {
    category: Category
    params: AutoParams | RealEstateParams | ElectronicsParams
    onChange: (field: string, value: unknown) => void
}
const inputClass = (value: unknown) => 
    value ? styles.input : `${styles.input} ${styles.input_optional}`

const ParamsFields = ({category, params, onChange}: Props) => {
    if (category === 'electronics'){
        return (
            <div>
                <label className={styles.label}>
                    Тип
                    <select 
                        className={inputClass((params as ElectronicsParams).type)}
                        name="type" 
                        onChange={(e) => onChange('type', e.target.value)}
                        value={(params as ElectronicsParams).type || ''}
                    >
                        <option value="" disabled hidden></option>
                        <option value="phone">Телефон</option>
                        <option value="laptop">Ноутбук</option>
                        <option value="misc">Разное</option>
                    </select>
                </label>
                <label className={styles.label}>
                    Бренд
                    <input 
                        className={inputClass((params as ElectronicsParams).brand)}
                        type="text" 
                        value={(params as ElectronicsParams).brand ?? ''}
                        onChange={(e) => onChange('brand', e.target.value)}
                        placeholder="Бренд"
                    />
                </label>
                <label className={styles.label}>
                    Модель
                    <input 
                        className={inputClass((params as ElectronicsParams).model)}
                        type="text" 
                        value={(params as ElectronicsParams).model ?? ''}
                        onChange={(e) => onChange('model', e.target.value)}
                        placeholder="Модель"
                    />
                </label>
                <label className={styles.label}>
                    Состояние
                    <select 
                        className={inputClass((params as ElectronicsParams).condition)}
                        name="condition"
                        value={(params as ElectronicsParams).condition ?? ''}
                        onChange={(e) => onChange('condition', e.target.value)}
                    >
                        <option value="" disabled hidden></option>
                        <option value="new">Новый</option>
                        <option value="used">Б/У</option>
                    </select>
                </label>
                <label className={styles.label}>
                    Цвет
                    <input 
                        className={inputClass((params as ElectronicsParams).color)}
                        type="text" 
                        name="color" 
                        value={(params as ElectronicsParams).color ?? ''}
                        onChange={(e) => onChange('color', e.target.value)}
                        placeholder="Цвет"
                    />
                </label>
            </div>
        )
    }
    if (category === 'auto'){
        return (
            <div>
                <label className={styles.label}>
                    Бренд
                    <input 
                        className={inputClass((params as AutoParams).brand)}
                        type="text" 
                        name="brand" 
                        value={(params as AutoParams).brand ?? ''}
                        onChange={(e) => onChange('brand', e.target.value)}
                    />
                </label>
                <label className={styles.label}>
                    Модель
                    <input 
                        className={inputClass((params as AutoParams).model)}
                        type="text"
                        name="model"
                        value={(params as AutoParams).model ?? ''}
                        onChange={(e) => onChange('model', e.target.value)}
                    />
                </label>
                <label className={styles.label}>
                    Год выпуска
                    <input 
                        className={inputClass((params as AutoParams).yearOfManufacture)}
                        type="number" 
                        name="yearOfManufacture" 
                        value={(params as AutoParams).yearOfManufacture ?? ''}
                        onChange={(e) => onChange('yearOfManufacture', Number(e.target.value))}
                    />
                </label>
                <label className={styles.label}>
                    Коробка передач
                    <select 
                        className={inputClass((params as AutoParams).transmission)}
                        name="transmission"
                        value={(params as AutoParams).transmission ?? ''}
                        onChange={(e) => onChange('transmission', e.target.value)}
                    >
                        <option value="" disabled hidden></option>
                        <option value="automatic">Автомат</option>
                        <option value="manual">Механика</option>
                    </select>
                </label>
                <label className={styles.label}>
                    Пробег, км
                    <input 
                        className={inputClass((params as AutoParams).mileage)}
                        type="number" 
                        name="mileage" 
                        value={(params as AutoParams).mileage ?? ''}
                        onChange={(e) => onChange('mileage', Number(e.target.value))}
                    />
                </label>
                <label className={styles.label}>
                    Мощность двигателя, л.с
                    <input 
                        className={inputClass((params as AutoParams).enginePower)}
                        type="number" 
                        name="enginePower" 
                        value={(params as AutoParams).enginePower ?? ''}
                        onChange={(e) => onChange('enginePower', Number(e.target.value))}
                    />
                </label>
            </div>
        )
    }
    if (category === 'real_estate'){
        return (
            <div>
                <label className={styles.label}>
                    Тип
                    <select 
                        className={inputClass((params as RealEstateParams).type)}
                        name="type"
                        value={(params as RealEstateParams).type ?? ''}
                        onChange={(e) => onChange('type', e.target.value)}
                    >
                        <option value="" disabled hidden></option>
                        <option value="flat">Квартира</option>
                        <option value="house">Дом</option>
                        <option value="room">Комната</option>
                    </select>
                </label>
                <label className={styles.label}>
                    Адрес
                    <input 
                        className={inputClass((params as RealEstateParams).address)}
                        type="text" 
                        name="address" 
                        value={(params as RealEstateParams).address ?? ''}
                        onChange={(e) => onChange('address', e.target.value)}
                    />
                </label>
                <label className={styles.label}>
                    Площадь, м²
                    <input 
                        className={inputClass((params as RealEstateParams).area)}
                        type="number" 
                        name="area" 
                        value={(params as RealEstateParams).area ?? ''}
                        onChange={(e) => onChange('area', Number(e.target.value))}
                    />
                </label>
                <label className={styles.label}>
                    Этаж
                    <input 
                        className={inputClass((params as RealEstateParams).floor)}
                        type="number" 
                        name="floor" 
                        value={(params as RealEstateParams).floor ?? ''}
                        onChange={(e) => onChange('floor', Number(e.target.value))}
                    />
                </label>
            </div>
        )
    }
    return null
}

export default ParamsFields