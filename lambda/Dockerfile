FROM public.ecr.aws/lambda/python:3.14

WORKDIR ${LAMBDA_TASK_ROOT}

RUN dnf install -y \
    mesa-libGL \
    && dnf clean all

COPY requirements.txt .

RUN pip install -r requirements.txt

# Copy function code
COPY . .


RUN wget https://your-storage/u2net_human_seg.onnx \
    -O ${LAMBDA_TASK_ROOT}/models/u2net_human_seg.onnx
# Set U2NET_HOME so rembg uses the local model
ENV U2NET_HOME=${LAMBDA_TASK_ROOT}/models


CMD [ "app.lambda_handler" ]