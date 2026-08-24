pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  parameters {
    booleanParam(
      name: 'DEPLOY',
      defaultValue: true,
      description: 'Deploy ด้วย docker compose หลัง build สำเร็จ'
    )
    string(
      name: 'NEXT_PUBLIC_BACKEND_URL',
      defaultValue: 'http://187.52.125.210:3001/laundry/api/',
      description: 'Backend URL ที่ browser เรียก (bake เข้า Next.js ตอน build)'
    )
    string(
      name: 'ADMIN_PORT',
      defaultValue: '3000',
      description: 'พอร์ตบน VPS ที่ map ไป container'
    )
  }

  environment {
    COMPOSE_PROJECT_NAME = 'baan-laundry-admin'
    IMAGE_NAME = 'baan-laundry-admin'
    NEXT_PUBLIC_BACKEND_URL = "${params.NEXT_PUBLIC_BACKEND_URL}"
    ADMIN_PORT = "${params.ADMIN_PORT}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build image') {
      steps {
        sh '''
          set -e
          export NEXT_PUBLIC_BACKEND_URL="${NEXT_PUBLIC_BACKEND_URL}"
          export ADMIN_PORT="${ADMIN_PORT}"
          docker compose build admin
        '''
      }
    }

    stage('Deploy') {
      when {
        expression { return params.DEPLOY == true }
      }
      steps {
        sh '''
          set -e
          export NEXT_PUBLIC_BACKEND_URL="${NEXT_PUBLIC_BACKEND_URL}"
          export ADMIN_PORT="${ADMIN_PORT}"
          docker compose up -d --remove-orphans admin
        '''
      }
    }

    stage('Health check') {
      when {
        expression { return params.DEPLOY == true }
      }
      steps {
        sh '''
          set -e
          echo "Waiting for Admin on :${ADMIN_PORT}/admin ..."
          for i in $(seq 1 30); do
            code="$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${ADMIN_PORT}/admin" || true)"
            if echo "$code" | grep -Eq '^[123]'; then
              echo "Admin is healthy (HTTP $code)"
              exit 0
            fi
            if [ "$i" -eq 30 ]; then
              echo "Admin health check failed (HTTP $code)"
              docker compose ps || true
              docker compose logs --tail=80 admin || true
              exit 1
            fi
            sleep 2
          done
        '''
      }
    }
  }

  post {
    success {
      echo "baan_laundry_admin #${env.BUILD_NUMBER} succeeded → http://187.52.125.210:${params.ADMIN_PORT}/admin"
    }
    failure {
      echo "baan_laundry_admin #${env.BUILD_NUMBER} failed"
      sh 'docker compose ps || true'
    }
  }
}
