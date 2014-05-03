import numpy as np
def ksum(A,dim):
    return np.sum(A,dim,keepdims=True)

def plsa(Ndw,Nz,iteration):
    #dimension order Nz->Nd->Nw
    [Nd,Nw] = np.shape(Ndw)
    Pd_z  = np.random.rand(Nz,Nd, 1)
    Pw_z  = np.random.rand(Nz, 1,Nw)
    Pz    = np.random.rand(Nz, 1, 1)
    Pz_dw = np.random.rand(Nz,Nd,Nw)
    Pdw   = np.expand_dims(Ndw,2)

    for i in range(iteration):
        Pz_dw = Pd_z * Pw_z * Pz
        Pz_dw = Pz_dw/ksum(Pz_dw,0)
    
        Pzdw = Ndw*Pz_dw
        Pz   = ksum(ksum(Pzdw,2),1)
        Pd_z = ksum(Pzdw,2)/Pz
        Pw_z = ksum(Pzdw,1)/Pz
        Pz   = Pz/ksum(Pz,0)



    Pz_d  = ksum(Pzdw,2)/ksum(ksum(Pzdw,2),0)
    Pz_w  = ksum(Pzdw,1)/ksum(ksum(Pzdw,1),0)
    
    Pd_z = Pd_z.reshape(Nz,Nd)
    Pw_z = Pw_z.reshape(Nz,Nw)
    Pz_d = Pz_d.reshape(Nz,Nd)
    Pz_w = Pz_w.reshape(Nz,Nw)
    
    return Pd_z, Pw_z,Pz_d,Pz_w
