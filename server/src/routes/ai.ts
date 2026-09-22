import { Router } from 'express'
import Groq from 'groq-sdk'


const router = Router()

// Клиент создаём лениво: без ключа сервер должен стартовать, падают только AI-роуты
let groqClient: Groq | null = null
function getGroq(): Groq | null {
    if (!process.env.GROQ_API_KEY) return null
    groqClient ??= new Groq({ apiKey: process.env.GROQ_API_KEY })
    return groqClient
}

router.use((_req, res, next) => {
    if (!getGroq()) {
        res.status(503).json({ error: 'AI недоступен: не задан GROQ_API_KEY' })
        return
    }
    next()
})


router.post('/suggest-description', async (req, res) =>{
    const { title, category, params } = req.body
    const paramsText = params && typeof params === 'object' 
        ? Object.entries(params).map(([key, val]) => `${key}: ${val}`).join('\n')
        : 'Параметры не указаны';
    try {
        const completion = await getGroq()!.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'user',
                    content: `
                            Ты помощник для написания объявлений на Авито.
                            Напиши привлекательное описание для объявления:
                            Название: ${title}
                            Категория: ${category}
                            Характеристики: ${paramsText}

                            Описание должно быть на русском языке, 3-5 предложений, без лишних слов.
                            Верни только текст описания без заголовков и пояснений.
                        `
                }
            ]
        })
    const text = completion.choices[0]?.message?.content
    if (!text) {
        res.status(502).json({ error: 'Пустой ответ от AI' })
        return
    }
    res.json({ text })
    } catch(err) {
        console.error(err)
        res.status(500).json({ error: 'Ошибка генерации' })
    }
})

router.post('/suggest-price', async (req, res) => {
    const { title, category, params } = req.body
    const paramsText = params && typeof params === 'object' 
        ? Object.entries(params).map(([key, val]) => `${key}: ${val}`).join('\n')
        : 'Параметры не указаны';
    try {
        const completion = await getGroq()!.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
            {
                role: 'user',
                content: `
                    Ты эксперт по аналитике цен на маркетплейсах и Авито. Ты умеешь отличать стоимость новых товаров от бывших в употреблении.
                    Определи рыночную стоимость для товара:
                    Название: ${title}
                    Категория: ${category}
                    Характеристики: ${paramsText}

                    ИНСТРУКЦИЯ ПО ФОРМАТУ:
                    Ответь строго по шаблону ниже. Если товар новый, во второй строке вместо АКБ пиши про запечатанную упаковку и гарантию.
                    
                    ШАБЛОН:
                    Средняя цена на [Название товара]:
                    [Цена от-до] ₽ — отличное состояние (или новый, если указано).
                    От [Цена] ₽ — идеал, малый износ АКБ (или запечатан в упаковке + гарантия).
                    [Цена от-до] ₽ — срочно или с дефектами (для новых: витринный экземпляр или вскрытая упаковка).

                    ТРЕБОВАНИЯ:
                    1. Только текст по шаблону, без вступлений.
                    2. Цены должны соответствовать текущему рынку.
                    3. Разделяй тысячи пробелом (например, 115 000).
                `
            }
        ]
    })
    const text = completion.choices[0]?.message?.content
    if (!text) {
        res.status(502).json({ error: 'Пустой ответ от AI' })
        return
    }
    res.json({ text })
    } catch(err) {
        console.error(err)
        res.status(500).json({ error: 'Ошибка генерации' })
    }
})

export default router