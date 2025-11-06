import React, { useEffect, useState } from 'react';
import { Form, Button, InputGroup, Card } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../../slices/usersApiSlice';
import { setCredentials } from '../../slices/authSlice';
import { toast, ToastContainer } from 'react-toastify';
import FormContainer from '../../components/FormContainer';
import Meta from '../../components/Meta';
import Footer from '../../components/Footer';
import Loader from '../../components/Loader';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector(state => state.auth);

  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const redirect = searchParams.get('redirect') || '/admin/dashboard';

  const [login, { isLoading }] = useLoginMutation();

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      navigate(redirect);
    }
  }, [userInfo, redirect, navigate]);

  const submitHandler = async e => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    try {
      const res = await login({ email, password, remember }).unwrap();
      
      // Check if user is admin before proceeding
      if (res.isAdmin) {  // Assuming res has isAdmin; adjust if your API uses a different field (e.g., role === 'admin')
        dispatch(setCredentials({ ...res }));
        // Optional: Handle 'remember' with localStorage if needed
        if (remember) {
          localStorage.setItem('userInfo', JSON.stringify(res));
        }
        navigate(redirect || '/admin/dashboard');
        toast.success('Login successful');
      } else {
        toast.error('Admin access required. Please use admin credentials.');
      }
    } catch (error) {
      toast.error(error?.data?.message || error.error || 'Login failed');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <main className='d-flex position-relative flex-column justify-content-center align-items-center'>
        <Meta title={'Admin Sign In'} />
        <FormContainer>
          <Card className='p-3 p-md-5'>
            <h1 className='mb-5 text-center'>Sign In</h1>
            <Form onSubmit={submitHandler}>
              <Form.Group className='mb-3' controlId='email'>
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type='email'
                  value={email}
                  placeholder='Enter email'
                  onChange={e => setEmail(e.target.value)}
                  required  // Added for basic HTML validation
                />
              </Form.Group>
              <Form.Group className='mb-3' controlId='password'>
                <Form.Label>Password</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    placeholder='Enter password'
                    onChange={e => setPassword(e.target.value)}
                    required  // Added for basic HTML validation
                  />
                  <InputGroup.Text
                    onClick={togglePasswordVisibility}
                    id='togglePasswordVisibility'
                    style={{ cursor: 'pointer' }}
                  >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>
              <Form.Group className='mb-3' controlId='checkbox'>
                <Form.Check
                  type='checkbox'
                  label='Keep me signed in.'
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                />
              </Form.Group>
              <Button
                className='my-3 w-100'
                variant='warning'
                type='submit'
                disabled={isLoading}
              >
                {isLoading ? <Loader size='sm' /> : 'Sign In'}  {/* Added loader for better UX */}
              </Button>
            </Form>
          </Card>
        </FormContainer>
      </main>
      <Footer />
      <ToastContainer />  {/* Render here if not in parent; adjust position/theme as needed */}
    </>
  );
};

export default AdminLoginPage;