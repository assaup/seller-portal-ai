import { useNavigate, useParams } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import { aiApi, itemsApi } from "../../api/items";
import { useRef, useState } from "react";
import type { Item, ItemUpdatePayload } from "../../types";
import ParamsFields from "../../components/ParamsFields/ParamsFields";
import LampIcon from "../../components/icons/LampIcon";
import Toast from "../../components/Toast/Toast";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { useAI } from "../../hooks/useAI";
import AITooltip from "../../components/AITooltip/AITooltip";
import styles from "./AdEditPage.module.scss";

const AdEditPage = () => {
  const { id } = useParams();

  const { data, loading, error } = useFetch<Item>(
    (signal) => itemsApi.getById(id!, signal),
    [id],
  );
  const [draft, setDraft, removeDraft] =
    useLocalStorage<ItemUpdatePayload | null>(`draft_${id}`, null);
  const [form, setForm] = useState<ItemUpdatePayload | null>(draft);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const currentForm =
    form ??
    (data
      ? {
          category: data.category,
          title: data.title,
          price: data.price,
          description: data.description,
          params: data.params,
        }
      : null);

  const navigate = useNavigate();
  const descriptionAI = useAI();
  const priceAI = useAI();
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)


  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error}</p>;
  if (!data) return null;
  if (!currentForm) return null;

  const handleChange = (field: keyof ItemUpdatePayload, value: unknown) => {
    setForm((prev) => {
      const base = prev ?? {
        category: data.category,
        title: data.title,
        price: data.price,
        description: data.description,
        params: data.params,
      };
      const next = { ...base, [field]: value };
      setDraft(next);
      return next;
    });
  };
  const handleParamChange = (field: string, value: unknown) => {
    setForm((prev) => {
      const base = prev ?? {
        category: data.category,
        title: data.title,
        price: data.price,
        description: data.description,
        params: data.params,
      };
      const next = { ...base, params: { ...base.params, [field]: value } };
      setDraft(next);
      return next;
    });
  };
  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    try {
      await itemsApi.update(id!, currentForm);
      setToast({ message: "Изменения сохранены", type: "success" });
      setTimeout(() => {
        navigate(`/ads/${id}`);
      }, 700);
      removeDraft();
    } catch (err) {
      setToast({
        message: "Ошибка сохранения. Попробуйте ещё раз или зайдите позже.",
        type: "error",
      });
      console.error(err);
    }
  };
  const handleReset = () => {
    navigate(`/ads/${id}`);
    removeDraft();
  };
  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };
  const inputClass = (field: string, value: unknown, required = false) => {
    const isTouched = touched[field];

    if (required) {
      if (!value && isTouched)
        return `${styles.input} ${styles.input_required}`; // красная
      return styles.input;
    }

    if (!value) return `${styles.input} ${styles.input_optional}`; // жёлтая
    return styles.input;
  };

  const isValid = !!currentForm.title && !!currentForm.price;

  const adjustHeight = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height='auto'
    el.style.height = `{el.scrollHeight}px`
  }

  return (
    <div className={styles.layout}>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Редактирование объявления</h1>
        <label className={styles.label}>
          Категория
          <select
            className={`${styles.input} ${styles.input__category}`}
            name="category"
            value={currentForm?.category}
            onChange={(e) => handleChange("category", e.target.value)}
          >
            <option value="electronics">Электроника</option>
            <option value="auto">Транспорт</option>
            <option value="real_estate">Недвижимость</option>
          </select>
        </label>

        <span className={styles.line}></span>

        <label className={styles.label}>
          <span className={styles.text}>Название</span>
          <input
            className={inputClass("title", currentForm.title, true)}
            type="text"
            name="title"
            value={currentForm?.title}
            onChange={(e) => handleChange("title", e.target.value)}
            onBlur={() => handleBlur("title")}
          />
          {touched.title && !currentForm.title && (
            <span className={styles.fieldError}>Поле обязательно</span>
          )}
        </label>

        <span className={styles.line}></span>
        <div className={styles.price}>
          <label className={styles.label}>
            <span className={styles.text}>Цена</span>
            <input
              className={inputClass("price", currentForm.price, true)}
              type="number"
              name="price"
              value={currentForm?.price}
              onChange={(e) => handleChange("price", Number(e.target.value))}
              onBlur={() => handleBlur("price")}
            />
            {touched.price && !currentForm.price && (
              <span className={styles.fieldError}>Поле обязательно</span>
            )}
          </label>

          <button
            className={`${styles.btn} ${styles.btn__needsRevision}`}
            type="button"
            onClick={() =>
              priceAI.request(async () => {
                const res = await aiApi.suggest('price', { 
                  title: currentForm.title,
                  category: currentForm.category,
                  params: currentForm.params });
                return res.text;
              })
            }
          >
            <LampIcon />
            {priceAI.loading ? "Выполняется запрос..." : "Узнать рыночную цену"}
          </button>

          <div className={styles.tooltip}>
            <AITooltip
              {...priceAI}
              onClose={priceAI.clear}
            />
          </div>
        </div>
        

        <span className={styles.line}></span>

        <h2 className={styles.titleSecond}>Характеристики</h2>
        <ParamsFields
          category={currentForm.category}
          params={currentForm.params}
          onChange={handleParamChange}
        />

        <span className={styles.line}></span>

        <label className={styles.label}>
          Описание
          <textarea
            ref={textareaRef}
            className={`${inputClass("description", currentForm.description)} ${styles.input__textarea}`}
            name="description"
            value={currentForm?.description}
            onChange={(e) => handleChange("description", e.target.value)}
            onInput={adjustHeight}
          ></textarea>
        </label>

        <button
          className={`${styles.btn} ${styles.btn__needsRevision}`}
          type="button"
          onClick={() =>
            descriptionAI.request(async () => {
              const res = await aiApi.suggest('description', {
                title: currentForm.title,
                category: currentForm.category, 
                params: currentForm.params,
              });
              return res.text;
            })
          }
        >
          <LampIcon />
          {descriptionAI.loading
            ? "Выполняется запрос..."
            : currentForm.description
              ? "Улучшить описание"
              : "Придумать описание"}
        </button>
        <AITooltip
          {...descriptionAI}
          onApply={(text) => {
            handleChange("description", text);
            descriptionAI.clear();
            setTimeout(adjustHeight, 0)
          }}
          onClose={descriptionAI.clear}
        />

        <div className={styles.btns}>
          <button
            type="submit"
            className={`${styles.btn} ${styles.btn_blue}`}
            disabled={!isValid}
          >
            Сохранить
          </button>
          <button type="button" onClick={handleReset} className={styles.btn}>
            Отменить
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdEditPage;
