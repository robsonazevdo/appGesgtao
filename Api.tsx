import AsyncStorage from '@react-native-async-storage/async-storage';

 //const BASE_API = 'http://192.168.0.133:5000'; // Exemplo real de IP local
const BASE_API = 'http://192.168.0.148:5000';

type SignInResponse = {
  token?: string;
  data?: {
    avatar: string;
    [key: string]: any;
  };
  error?: string;
};

type SignUpResponse = {
  [x: string]: any;
  token?: string;
  error?: string;
};

type CheckTokenResponse = {
  token?: string;
  data?: {
    avatar?: string;
    [key: string]: any;
  };
  error?: string;
};

type Appointment = any;

type AppointmentResponse = {
  summary(summary: any): unknown;
  data(data: any): unknown;
  success?: boolean;
  appointment?: Appointment;
  appointments?: Appointment[];
  error?: string;
};

type GetBarbersResponse = any; 

const Api = {
  checkToken: async (token: string): Promise<CheckTokenResponse> => {
    const req = await fetch(`${BASE_API}/auth/refresh`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });
    const json = await req.json();
    return json;
  },

  signIn: async (email: string, password: string): Promise<SignInResponse> => {
    const req = await fetch(`${BASE_API}/auth/login`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    const json = await req.json();
    return json;
  },

  signUp: async (name: string, email: string, password: string): Promise<SignUpResponse> => {
    const req = await fetch(`${BASE_API}/auth/user`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });
    const json = await req.json();
    return json;
  },

  logout: async (): Promise<SignUpResponse> => {
    const token = await AsyncStorage.getItem('token');
    const req = await fetch(`${BASE_API}/auth/logout`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token})
    });
    const json = await req.json();
    return json;
  },

  getBarbers: async (
    lat: number | null = null,
    lng: number | null = null,
    loc: string | null = null
  ): Promise<GetBarbersResponse> => {
    const token = await AsyncStorage.getItem('token');
    const req = await fetch(`${BASE_API}/barbers?token=${token}&lat=${lat}&lng=${lng}&loc=${loc}`);
    const json = await req.json();
    return json;
  },

    getAllBarbers: async ( ): Promise<GetBarbersResponse> => {
    const token = await AsyncStorage.getItem('token');
    
    const req = await fetch(`${BASE_API}/barbers/all`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });;
    const json = await req.json();
    return json;
  },

  getBarbersName: async (name: string): Promise<GetBarbersResponse> => { 
  const token = await AsyncStorage.getItem('token');

  const req = await fetch(`${BASE_API}/barbers/search?token=${token}&name=${encodeURIComponent(name)}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  });

  const json = await req.json();
  return json;
},

  getBarber: async (id: number | null = null): Promise<GetBarbersResponse> => {
  const token = await AsyncStorage.getItem('token');
  const req = await fetch(`${BASE_API}/barber/${id}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await req.json();
  return json;
},


setFavorite: async (barberId: number | null = null): Promise<GetBarbersResponse> => {
  const token = await AsyncStorage.getItem('token');

  const req = await fetch(`${BASE_API}/auth/favorite`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, 
    },
    body: JSON.stringify({ barber: barberId }) 
  });

  const json = await req.json();
  return json;
},

getFavorites: async (): Promise<GetBarbersResponse> => {
  const token = await AsyncStorage.getItem('token');

  const req = await fetch(`${BASE_API}/auth/favorites`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await req.json();
  return json;
},

getFavorited: async (barberId: number | null = null): Promise<GetBarbersResponse> => {
  const token = await AsyncStorage.getItem('token');

  const req = await fetch(`${BASE_API}/auth/favorited?barber=${barberId}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  const json = await req.json();
  return json;
},


createAppointment: async (data: {
  client_id: number;
  barber_id: number;
  service: number;
  datetime: string;
  service_id: number;
}): Promise<Appointment> => {
  const token = await AsyncStorage.getItem('token');
  const req = await fetch(`${BASE_API}/appointments`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const json = await req.json();
  return json;
},


getAppointments: async (): Promise<AppointmentResponse> => {
  const token = await AsyncStorage.getItem('token');

  const req = await fetch(`${BASE_API}/appointments`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await req.json();
  return json;
},


cancelAppointment: async (appointmentId: number): Promise<any> => {
  const token = await AsyncStorage.getItem('token');

  const req = await fetch(`${BASE_API}/appointments/${appointmentId}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await req.json();
  return json;
},

getSumaryToday: async (): Promise<AppointmentResponse> => {
  const token = await AsyncStorage.getItem('token');

  const req = await fetch(`${BASE_API}/appointments/today-summary`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await req.json();
  return json;
},

 getClients: async ( ): Promise<GetBarbersResponse> => {
    const token = await AsyncStorage.getItem('token');
    
    const req = await fetch(`${BASE_API}/clients/all`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
    const json = await req.json();
    return json;
  },

  getClientsSerch: async (data: { name: string }) => {
    const token = await AsyncStorage.getItem('token');
    const req = await fetch(`${BASE_API}/clients/name`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: data.name }),
    });
  const json = await req.json();
  return json;
    
},

UpdateClient: async (data: { id: number; name: string; phone: string; email: string; created_at: string }) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const req = await fetch(`${BASE_API}/clients/update`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
         Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const json = await req.json();
    return json;
  } catch (error) {
    console.error('Erro na API updateClient:', error);
    return { error: 'Erro na comunicação com o servidor' };
  }
},


  setClients: async (data: { name: string; phone: string; email: string, created_at: string }) => {
  const token = await AsyncStorage.getItem('token');
  const req = await fetch(`${BASE_API}/clients/clients`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const json = await req.json();
  return json;
},

deleteClient: async ({ client_id }: { client_id: number }) => {
  const token = await AsyncStorage.getItem('token');
  const res = await fetch(`${BASE_API}/clients/delete/${client_id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
},


  getServices: async ( ): Promise<GetBarbersResponse> => {
    const token = await AsyncStorage.getItem('token');
    
    const req = await fetch(`${BASE_API}/service/all`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });;
    const json = await req.json();
    return json;
  },

  getServiceSerch: async (data: { name: string }) => {
    const token = await AsyncStorage.getItem('token');
    const req = await fetch(`${BASE_API}/service/name`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: data.name }),
    });
  const json = await req.json();
  return json; 
},

UpdateService: async (data: { id: number; name: string;}) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const req = await fetch(`${BASE_API}/service/update`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
         Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const json = await req.json();
    return json;
  } catch (error) {
    console.error('Erro na API updateClient:', error);
    return { error: 'Erro na comunicação com o servidor' };
  }
},

setConfigService: async (data: { id: number; barber_id: number; name: string; price: number; duration: number;  }) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const req = await fetch(`${BASE_API}/service/update`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
         Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const json = await req.json();
    return json;
  } catch (error) {
    console.error('Erro na API updateClient:', error);
    return { error: 'Erro na comunicação com o servidor' };
  }
},

setBarberService: async (data: { barber_id: number; name: string; price: number; duration: number; service_id: number;  }) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const req = await fetch(`${BASE_API}/service/barber_service`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
         Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const json = await req.json();
    return json;
  } catch (error) {
    console.error('Erro na API updateClient:', error);
    return { error: 'Erro na comunicação com o servidor' };
  }
},



getConfigServiceSerch: async (data: { name: string }) => {
    const token = await AsyncStorage.getItem('token');
    const req = await fetch(`${BASE_API}/service/barber_service/name`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: data.name }),
    });
  const json = await req.json();
  return json; 
},


  setServices: async (data: { name: string }) => {
  const token = await AsyncStorage.getItem('token');
  const req = await fetch(`${BASE_API}/service/service`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const text = await req.text(); 

  try {
    const json = JSON.parse(text);
    return json;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    console.log('Erro ao converter resposta para JSON:', text);
    throw new Error('Resposta inválida da API');
  }
},


deleteService: async ({ service_id }: { service_id: number }) => {
  const token = await AsyncStorage.getItem('token');
  const res = await fetch(`${BASE_API}/service/delete/${service_id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },

    
  });
  return res.json();
},


 setProducts: async (data: { name: string; price: number; cost: number; unit: string; description: string;}) => {
  const token = await AsyncStorage.getItem('token');
  const req = await fetch(`${BASE_API}/products/products`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const text = await req.text(); 

  try {
    const json = JSON.parse(text);
    return json;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    console.log('Erro ao converter resposta para JSON:', text);
    throw new Error('Resposta inválida da API');
  }
},

  getProdutcsSerch: async (data: { name: string }) => {
    const token = await AsyncStorage.getItem('token');
    const req = await fetch(`${BASE_API}/products/name`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: data.name }),
    });
  const json = await req.json();
  return json; 
},

UpdateProdutcs: async (data: {id: number; name: string; price: number; cost: number; unit: string; description: string;}) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const req = await fetch(`${BASE_API}/products/update`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
         Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const json = await req.json();
    return json;
  } catch (error) {
    console.error('Erro na API updateProdutcs:', error);
    return { error: 'Erro na comunicação com o servidor' };
  }
},

deleteProdutcs: async ({ products_id }: { products_id: number }) => {
  const token = await AsyncStorage.getItem('token');
  const res = await fetch(`${BASE_API}/products/delete/${products_id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },

    
  });
  return res.json();
},

getProductOptions: async ( ): Promise<GetBarbersResponse> => {
    const token = await AsyncStorage.getItem('token');
    
    const req = await fetch(`${BASE_API}/products/list`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });;
    const json = await req.json();
    return json;
  },


getStockSerch: async (data: { name: string }) => {
    const token = await AsyncStorage.getItem('token');
    const req = await fetch(`${BASE_API}/stock/movimentacoes`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: data.name }),
    });
  const json = await req.json();
  return json; 
},

setStock: async (data: { product_id: number;
  quantity: number;
  type: 'entrada' | 'saida';
  description: string;
  date: string;}) => {
  const token = await AsyncStorage.getItem('token');
  const req = await fetch(`${BASE_API}/stock/stock`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const text = await req.text(); 

  try {
    const json = JSON.parse(text);
    return json;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    console.log('Erro ao converter resposta para JSON:', text);
    throw new Error('Resposta inválida da API');
  }
},

UpdateStock: async (data: {id: number; name: string; price: number; cost: number; unit: string; description: string;}) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const req = await fetch(`${BASE_API}/stock/update`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
         Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const json = await req.json();
    return json;
  } catch (error) {
    console.error('Erro na API updateProdutcs:', error);
    return { error: 'Erro na comunicação com o servidor' };
  }
},

};

export default Api;