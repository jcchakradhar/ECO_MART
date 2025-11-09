export function createOrder(order) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch('/orders', {
        method: 'POST',
        body: JSON.stringify(order),
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
      });

      let data = null;
      try {
        data = await response.json();
      } catch (err) {
        data = null;
      }

      if (!response.ok) {
        const message = (data && data.message) || 'Unable to create order.';
        const error = new Error(message);
        error.status = response.status;
        error.data = data;
        reject(error);
        return;
      }

      resolve({ data });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Network error');
      reject(err);
    }
  });
}

export function updateOrder(order) {
  return new Promise(async (resolve) => {
    const response = await fetch('/orders/' + order.id, {
      method: 'PATCH',
      body: JSON.stringify(order),
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
    });
    const data = await response.json();
    resolve({ data });
  });
}

export function fetchAllOrders(sort, pagination) {
  let queryString = '';

  for (let key in sort) {
    queryString += `${key}=${sort[key]}&`;
  }
  for (let key in pagination) {
    queryString += `${key}=${pagination[key]}&`;
  }

  return new Promise(async (resolve) => {
    const response = await fetch(
      '/orders?' + queryString,
      { credentials: 'include' }
    );
    const data = await response.json();
    const totalOrders = await response.headers.get('X-Total-Count');
    resolve({ data: { orders: data, totalOrders: +totalOrders } });
  });
}
