import styles from './createPost.module.scss';
import { useEffect, useRef, useState } from 'react';
import Button from '../../Button/Button';
import ImgSkeleton from './ImgSkeleton';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import SimpleEditor from '../SimpleEditor/SimpleEditor';
import { createPostSchemaValidate } from '../../../utils/validateSchema/validateSchema';
import { YupErrorsResolve } from '../../../utils/validateSchema/type';
import ValidateErrorMessage from '../../auth/ValidateErrorMessage/ValidateErrorMessage';
import scrollTo from '../../../utils/scrollTo';
import { PropsInterface } from './types';
import { useAppSelector } from '../../../redux/store';
import backAfterLogin from '../../../utils/backAfterLogin';
import { useCreatePostMutation, useEditPostMutation } from '../../../redux/slices/posts/postsApi';
const IMG_URL = process.env.REACT_APP_IMG_URL;

const CreatePost: React.FC<PropsInterface> = ({ title, text, imageUrl, tags }) => {
    const editPostImg = imageUrl ? `${IMG_URL}${imageUrl}` : '';
    const [blobLinkImg, setBlobLinkImg] = useState<string>(editPostImg);
    const [inputValueImg, setInputValueImg] = useState<string>('');
    const [fieldError, setFieldError] = useState({
        name: '',
        error: '',
    });
    const isAuth = useAppSelector((store) => store.auth.isAuth);

    const fileImgRef = useRef<HTMLInputElement>(null);
    const titleRef = useRef<HTMLInputElement>(null);
    const tagsRef = useRef<HTMLInputElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { id } = useParams();

    const [createPost, { data, isLoading, isSuccess }] = useCreatePostMutation();
    const [editPost, { data: editData, isLoading: editIsLoading, isSuccess: editIsSuccess }] =
        useEditPostMutation();

    const triggeredInput = () => {
        if (fileImgRef && fileImgRef.current) {
            fileImgRef.current.click();
        }
    };

    const uploadImg = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const fileType = e.target.files[0].type;
            if (fileType === 'image/jpeg' || fileType === 'image/png' || fileType === 'image/jpg') {
                const url = URL.createObjectURL(e.target.files[0]);
                setBlobLinkImg(url);
                setInputValueImg(e.target.value);
                return;
            }
        }
        setBlobLinkImg('');
        setInputValueImg('');
    };

    const errorReset = () => {
        setFieldError({ name: '', error: '' });
    };

    const resetImgLink = () => {
        if (window.confirm('Remove this image?')) {
            setBlobLinkImg('');
            setInputValueImg('');
        }
    };
    const editImagePath = (formData: FormData, id: string) => {
        if (imageUrl && blobLinkImg && !inputValueImg) {
            formData.set('image', imageUrl);
        }
        editPost({ formData, postId: id });
    };

    const submit = (e: React.SyntheticEvent<EventTarget>) => {
        e.preventDefault();
        const target = e.target as (typeof e.target & HTMLFormElement) & HTMLFormElement[];
        const formData = new FormData(target);
        formData.append('text', target[4].value);
        const formProps = Object.fromEntries(formData) as {
            image: File | string;
            text: string;
            title: string;
            tags: string;
        };

        createPostSchemaValidate
            .validate({
                image: formProps.image,
                title: formProps.title,
                text: formProps.text,
                tags: formProps.tags,
            })
            .then(() => {
                id ? editImagePath(formData, id) : createPost(formData);
            })
            .catch((err: YupErrorsResolve) => {
                setFieldError({ name: err.path, error: err.errors[0] });
                scrollTo([titleRef, textRef, tagsRef, imageRef], err.path, 'center');
            });
    };
    useEffect(() => {
        if (isSuccess && data) {
            navigate(`/posts/${data.post._id}`);
        } else if (editData && editIsSuccess) {
            navigate(`/posts/${id}`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSuccess, editIsSuccess]);

    useEffect(() => {
        window.scroll(0, 0);
    }, []);
    if (!isAuth) {
        return <Navigate to={'/login'} />;
    }
    return (
        <section className={styles.create}>
            <form onSubmit={submit}>
                <div className={styles.head}>
                    <div className={styles.imgBlock}>
                        {blobLinkImg ? (
                            <div
                                className={styles.img}
                                ref={imageRef}
                                data-element={'image'}
                                style={
                                    fieldError.name === 'image'
                                        ? { border: '2px solid red', borderRadius: '7px' }
                                        : { border: '2px solid transparent' }
                                }>
                                <img src={blobLinkImg} alt='post img' />
                                <span onClick={resetImgLink}></span>
                            </div>
                        ) : (
                            <ImgSkeleton />
                        )}

                        <div className={styles.button} onClick={triggeredInput}>
                            <input
                                type='file'
                                accept='image/*'
                                hidden
                                ref={fileImgRef}
                                value={inputValueImg}
                                onChange={uploadImg}
                                name='image'
                            />
                            <Button loading={false} text={'Upload img'} />
                        </div>
                    </div>
                    <div className={styles.titleBlock}>
                        <input
                            data-element={'title'}
                            ref={titleRef}
                            onFocus={errorReset}
                            defaultValue={title}
                            name='title'
                            type='text'
                            placeholder='Enter the title'
                            style={
                                fieldError.name === 'title'
                                    ? { borderBottom: '2px solid red' }
                                    : { borderBottom: '' }
                            }
                        />
                        <input
                            data-element={'tags'}
                            ref={tagsRef}
                            onFocus={errorReset}
                            defaultValue={tags}
                            name='tags'
                            type='text'
                            placeholder='Add #tags'
                            style={
                                fieldError.name === 'tags'
                                    ? { borderBottom: '2px solid red' }
                                    : { borderBottom: '' }
                            }
                        />
                    </div>
                </div>

                <div
                    ref={textRef}
                    data-element={'text'}
                    className={styles.editor}
                    style={
                        fieldError.name === 'text'
                            ? { border: '1px solid red', borderRadius: '5px' }
                            : { border: '1px solid #cfd4d9' }
                    }>
                    <SimpleEditor resetError={errorReset} defaultValue={text} />
                </div>
                <div className={styles.buttons}>
                    <Button
                        text={'Submit'}
                        type={'submit'}
                        loading={isLoading || editIsLoading ? true : false}
                    />

                    <div className={styles.cancel} onClick={() => backAfterLogin(navigate)}>
                        <span>Cancel</span>
                    </div>
                </div>
            </form>
            {fieldError.error && (
                <div className={styles.fieldError}>
                    <ValidateErrorMessage message={`${fieldError.name}: ${fieldError.error}`} />
                </div>
            )}
        </section>
    );
};
export default CreatePost;
